import sys
import json
import logging
import re
import traceback
import signal
import time
import threading
import os

from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, T5Tokenizer, T5ForConditionalGeneration


# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Model configuration
model_name = "google/flan-t5-base"

# Initialize model and tokenizer with error handling
tokenizer = None
model = None

def load_model(model_path=model_name):
    """Load the model and tokenizer with fallback options."""
    global tokenizer, model
    
    logger.info(f"Loading model: {model_path}")
    try:
        # Try using specific T5 classes first
        try:
            tokenizer = T5Tokenizer.from_pretrained(model_path)
            model = T5ForConditionalGeneration.from_pretrained(model_path, device_map="auto")
            logger.info("Model loaded successfully using T5 specific classes")
            return True
        except Exception as e:
            logger.warning(f"Could not load model with T5 specific classes: {str(e)}")
            logger.info("Attempting to load with Auto classes...")
            
            # Fall back to Auto classes
            tokenizer = AutoTokenizer.from_pretrained(model_path, use_fast=False)
            model = AutoModelForSeq2SeqLM.from_pretrained(model_path, device_map="auto")
            logger.info("Model loaded successfully using Auto classes")
            return True
            
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        logger.error(traceback.format_exc())
        tokenizer = None
        model = None
        return False

# Try to load the model on startup
model_loaded = load_model()

def format_to_json(text):
    """
    Attempt to extract and format JSON from the generated text.
    If the text isn't valid JSON, try to extract an array-like structure.
    Enhanced to better handle the detailed career recommendation format.
    """
    logger.info(f"Attempting to format text to JSON: {text[:100]}...")
    
    # First try direct JSON parsing
    try:
        # Try to clean up common JSON formatting issues
        # Replace single quotes with double quotes for JSON compatibility
        cleaned_text = text.replace("'", "\"")
        # Fix potential missing quotes around keys
        cleaned_text = re.sub(r'(\s*)(\w+)(\s*):(\s*)', r'\1"\2"\3:\4', cleaned_text)
        # Fix quote mismatches
        cleaned_text = cleaned_text.replace(";", ",").replace("'", "\"")
        
        logger.info(f"Cleaned text for JSON parsing: {cleaned_text[:100]}...")
        
        parsed_json = json.loads(cleaned_text)
        
        logger.info("Successfully parsed JSON directly")
        
        # Ensure all required fields are present
        for item in parsed_json:
            if isinstance(item, dict):
                # Make sure each entry has the required fields
                if "career" not in item:
                    item["career"] = "Unspecified Career"
                    logger.warning("Added missing 'career' field to an item")
                if "description" not in item:
                    item["description"] = "No description provided."
                    logger.warning("Added missing 'description' field to an item")
                # Add skill_match and budget_fit if they don't exist
                if "skill_match" not in item:
                    item["skill_match"] = "This career utilizes your existing skills."
                    logger.warning("Added missing 'skill_match' field to an item")
                if "budget_fit" not in item:
                    item["budget_fit"] = "Your budget is sufficient for the required training."
                    logger.warning("Added missing 'budget_fit' field to an item")
                    
        return parsed_json
    except json.JSONDecodeError as e:
        logger.warning(f"Direct JSON parsing failed: {str(e)}")
    
    # Try to extract array-like structure using regex
    try:
        # Look for text that resembles a JSON array
        logger.info("Attempting to extract JSON array using regex")
        array_pattern = r'\[.*\]'
        match = re.search(array_pattern, text, re.DOTALL)
        if match:
            json_text = match.group(0)
            # Clean up the extracted text
            json_text = json_text.replace("'", "\"")
            json_text = re.sub(r'(\s*)(\w+)(\s*):(\s*)', r'\1"\2"\3:\4', json_text)
            json_text = json_text.replace(";", ",")
            
            logger.info(f"Extracted potential JSON array: {json_text[:100]}...")
            
            try:
                parsed_json = json.loads(json_text)
                logger.info("Successfully parsed JSON array from regex extraction")
                return parsed_json
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse extracted JSON array: {str(e)}")
        else:
            logger.warning("No JSON array pattern found in text")
    except (json.JSONDecodeError, AttributeError) as e:
        logger.warning(f"JSON array extraction failed: {str(e)}")
    
    # Try to extract individual key-value pairs
    try:
        logger.info("Attempting to extract individual career entries")
        # Look for patterns like "career": "Software Developer"
        career_pattern = r'"career"\s*:\s*"([^"]+)"'
        desc_pattern = r'"description"\s*:\s*"([^"]+)"'
        skill_pattern = r'"skill_match"\s*:\s*"([^"]+)"'
        budget_pattern = r'"budget_fit"\s*:\s*"([^"]+)"'
        
        careers = []
        
        # Find all career matches
        career_matches = re.findall(career_pattern, text)
        logger.info(f"Found {len(career_matches)} potential career matches")
        
        # For each career, try to find corresponding description, skill, and budget
        for i, career in enumerate(career_matches):
            entry = {"career": career}
            
            # Try to find description
            desc_matches = re.findall(desc_pattern, text)
            if i < len(desc_matches):
                entry["description"] = desc_matches[i]
            else:
                entry["description"] = "No description available."
                logger.warning(f"No description found for career: {career}")
            
            # Try to find skill match
            skill_matches = re.findall(skill_pattern, text)
            if i < len(skill_matches):
                entry["skill_match"] = skill_matches[i]
            else:
                entry["skill_match"] = "This career utilizes your existing skills."
                logger.warning(f"No skill match found for career: {career}")
            
            # Try to find budget fit
            budget_matches = re.findall(budget_pattern, text)
            if i < len(budget_matches):
                entry["budget_fit"] = budget_matches[i]
            else:
                entry["budget_fit"] = "Your budget is suitable for this career path."
                logger.warning(f"No budget fit found for career: {career}")
            
            careers.append(entry)
        
        if careers:
            logger.info(f"Successfully extracted {len(careers)} career entries from text")
            return careers
    except Exception as e:
        logger.warning(f"Failed to extract individual career entries: {str(e)}")
    
    # If we still don't have valid JSON, attempt to create it from the text
    try:
        logger.info("Attempting to parse text line by line")
        # Extract career-description pairs
        careers = []
        lines = text.split('\n')
        current_career = None
        current_description = []
        current_skill_match = None
        current_budget_fit = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check for career indicators
            if "career" in line.lower() and ":" in line:
                # Save previous career if exists
                if current_career:
                    career_entry = {
                        "career": current_career,
                        "description": ' '.join(current_description) if current_description else "No description available."
                    }
                    if current_skill_match:
                        career_entry["skill_match"] = current_skill_match
                    else:
                        career_entry["skill_match"] = "This career utilizes your existing skills."
                    
                    if current_budget_fit:
                        career_entry["budget_fit"] = current_budget_fit
                    else:
                        career_entry["budget_fit"] = "Your budget is suitable for this career path."
                    
                    careers.append(career_entry)
                
                # Extract new career title
                current_career = line.split(':', 1)[1].strip().strip('"\'')
                current_description = []
                current_skill_match = None
                current_budget_fit = None
                logger.info(f"Found career: {current_career}")
            
            # Check for description indicators
            elif "description" in line.lower() and ":" in line:
                current_description = [line.split(':', 1)[1].strip().strip('"\'')]
                logger.info(f"Found description for {current_career}")
            
            # Check for skill match indicators
            elif any(term in line.lower() for term in ["skill_match", "skill match", "skills"]) and ":" in line:
                current_skill_match = line.split(':', 1)[1].strip().strip('"\'')
                logger.info(f"Found skill match for {current_career}")
            
            # Check for budget fit indicators
            elif any(term in line.lower() for term in ["budget_fit", "budget fit", "budget"]) and ":" in line:
                current_budget_fit = line.split(':', 1)[1].strip().strip('"\'')
                logger.info(f"Found budget fit for {current_career}")
            
            # Otherwise, add to current description
            elif current_career is not None and not current_description:
                current_description.append(line)
            elif current_career is not None and current_description:
                current_description.append(line)
        
        # Add the last career
        if current_career:
            career_entry = {
                "career": current_career,
                "description": ' '.join(current_description) if current_description else "No description available."
            }
            if current_skill_match:
                career_entry["skill_match"] = current_skill_match
            else:
                career_entry["skill_match"] = "This career utilizes your existing skills."
            
            if current_budget_fit:
                career_entry["budget_fit"] = current_budget_fit
            else:
                career_entry["budget_fit"] = "Your budget is suitable for this career path."
            
            careers.append(career_entry)
        
        if careers:
            logger.info(f"Successfully extracted {len(careers)} careers from line-by-line parsing")
            return careers
    except Exception as e:
        logger.error(f"Line-by-line parsing failed: {str(e)}")
    
    # As a last resort, extract any career-like information from the text
    logger.warning("All JSON parsing methods failed, attempting to extract career information from raw text")
    
    # Try to find anything that looks like a job title
    job_titles = re.findall(r'(?:career|job|profession|position)(?:\s*:\s*|\s+is\s+)["\'"]?([^"\'",;.]+)["\'"]?', text, re.IGNORECASE)
    
    if job_titles:
        logger.info(f"Found {len(job_titles)} potential job titles in raw text")
        careers = []
        
        for title in job_titles[:3]:  # Limit to 3 careers
            careers.append({
                "career": title.strip(),
                "description": "This career was extracted from model output. Please run the query again for more details.",
                "skill_match": "Matches with your provided skills.",
                "budget_fit": "Budget considerations could not be determined."
            })
        
        return careers
    
    # If everything fails, return an error
    logger.error("Failed to extract any meaningful career information from model output")
    return [{
        "career": "Error in Career Recommendation",
        "description": "The model produced output that could not be parsed into career recommendations. Please try again with more specific skills and interests.",
        "skill_match": "Unable to match skills to careers due to processing error.",
        "budget_fit": "Budget analysis not available due to processing error."
    }]

def validate_and_enhance_recommendations(recommendations, skills, interests):
    """
    Validate and enhance the generated recommendations to ensure they are relevant to the user's skills and interests.
    If recommendations are not relevant, replace them with pre-defined options that match the domain.
    """
    logger.info("Validating and enhancing recommendations for relevance")
    
    # Define domains for validation
    ai_ml_terms = [
        "ai", "machine learning", "deep learning", "artificial intelligence", "neural network", "nlp", "natural language", 
        "computer vision", "robotics", "automation", "data science", "algorithm", "ml engineer", "ai engineer", "ml ops"
    ]
    
    # Check if the career titles and descriptions are relevant to AI/ML/robotics
    valid_recommendations = []
    skill_set = [skill.lower() for skill in skills]
    interest_set = [interest.lower() for interest in interests]
    
    for rec in recommendations:
        # Check if the career is in the AI/ML domain
        career_title = rec.get("career", "").lower()
        description = rec.get("description", "").lower()
        
        # Check if career or description contains AI/ML terms
        is_relevant = any(term in career_title or term in description for term in ai_ml_terms)
        
        # Check if it mentions any of the user's skills or interests
        mentions_skills = any(skill in career_title or skill in description for skill in skill_set)
        mentions_interests = any(interest in career_title or interest in description for interest in interest_set)
        
        if is_relevant and (mentions_skills or mentions_interests):
            # Valid recommendation
            valid_recommendations.append(rec)
            logger.info(f"Valid recommendation: {rec['career']}")
        else:
            logger.warning(f"Recommendation not relevant to AI/ML or user profile: {rec['career']}")
    
    # If we have fewer than 3 valid recommendations, add domain-specific fallbacks
    if len(valid_recommendations) < 3:
        logger.warning(f"Only {len(valid_recommendations)} valid recommendations found. Adding domain-specific options.")
        
        # Define domain-specific careers based on skills
        ai_ml_careers = [
            {
                "career": "Computer Vision Engineer",
                "description": "Develops algorithms and systems that can analyze, process, and understand visual data from the world. Creates solutions for object detection, image recognition, and scene understanding.",
                "skill_match": f"Leverages {', '.join(skills)} to build advanced computer vision systems that can perceive and interpret visual information.",
                "budget_fit": "The budget is sufficient for specialized computer vision courses and certifications in deep learning frameworks like TensorFlow and PyTorch."
            },
            {
                "career": "NLP Specialist",
                "description": "Designs and implements algorithms that allow computers to process, analyze, and generate human language. Creates solutions for text classification, sentiment analysis, and language generation.",
                "skill_match": f"Utilizes {', '.join(skills)} to develop systems that can understand and generate human language.",
                "budget_fit": "The budget allows for comprehensive NLP specialization courses and certifications in transformer models and language understanding."
            },
            {
                "career": "AI Research Scientist",
                "description": "Conducts research to advance the field of artificial intelligence. Develops new algorithms, approaches, and methodologies to solve complex AI problems.",
                "skill_match": f"Applies {', '.join(skills)} to push the boundaries of what's possible in AI research.",
                "budget_fit": "The budget can cover specialized AI research courses and participation in key conferences and workshops."
            },
            {
                "career": "Robotics Software Engineer",
                "description": "Develops software that controls robotic systems, enabling them to perform tasks autonomously or semi-autonomously. Works on perception, planning, and control algorithms.",
                "skill_match": f"Combines {', '.join(skills)} to create intelligent systems that can perceive and interact with the physical world.",
                "budget_fit": "The budget is adequate for robotics programming courses and certifications in ROS (Robot Operating System) and related technologies."
            }
        ]
        
        # Add domain-specific careers until we have 3
        for career in ai_ml_careers:
            if len(valid_recommendations) >= 3:
                break
                
            # Check if this career is already in our valid recommendations
            if not any(rec.get("career") == career["career"] for rec in valid_recommendations):
                valid_recommendations.append(career)
                logger.info(f"Added domain-specific career: {career['career']}")
    
    # Ensure we only return exactly 3 recommendations
    return valid_recommendations[:3]

def generate_recommendations(skills, interests, budget):
    """Generate career recommendations based on skills, interests, and budget."""
    # Check if model is properly loaded
    if model is None or tokenizer is None:
        logger.error("Model or tokenizer not initialized properly")
        # Try to load the model one more time
        if load_model():
            logger.info("Successfully loaded model on retry")
        else:
            logger.error("Failed to load model on retry")
            return [{"career": "Error", "description": "Model initialization failed. Please check logs."}]
    
    try:
        # Create a focused prompt specifically for AI/ML/robotics careers
        prompt = (
            f"### TASK ###\n"
            f"Generate exactly 3 AI, machine learning, or robotics career recommendations for someone with the following profile.\n\n"
            f"### PROFILE ###\n"
            f"- Skills: {', '.join(skills)}\n"
            f"- Interests: {', '.join(interests)}\n"
            f"- Education Budget: ${budget}\n\n"
            f"### JSON FORMAT REQUIREMENTS ###\n"
            f"- Start with an opening bracket [\n"
            f"- End with a closing bracket ]\n"
            f"- Use double quotes for all keys and string values\n"
            f"- Each career must be an object with these exact keys: \"career\", \"description\", \"skill_match\", \"budget_fit\"\n"
            f"- Objects must be separated by commas\n"
            f"- No trailing commas after the last object\n"
            f"- No comments or additional text before or after the JSON array\n\n"
            f"### CAREER RECOMMENDATIONS REQUIREMENTS ###\n"
            f"1. Each career must be a SPECIFIC job title in the AI, machine learning, or robotics field\n"
            f"2. Each career must directly utilize the person's skills in {', '.join(skills)}\n"
            f"3. Each career must relate to their interests in {', '.join(interests)}\n"
            f"4. Analyze if the ${budget} budget is sufficient for required education/certifications\n"
            f"5. Provide detailed, realistic information about each career\n\n"
            f"### EXAMPLE FORMAT ###\n"
            f"This is an example format only. DO NOT copy the career titles or content. Generate NEW careers specific to the profile above.\n\n"
            f"[\n"
            f"  {{\n"
            f'    "career": "Example Career Title 1",\n'
            f'    "description": "Detailed description of what this job involves day-to-day.",\n'
            f'    "skill_match": "Explanation of how specific skills from the profile apply to this role.",\n'
            f'    "budget_fit": "Analysis of how the budget aligns with education requirements."\n'
            f"  }},\n"
            f"  {{\n"
            f'    "career": "Example Career Title 2",\n'
            f'    "description": "...",\n'
            f'    "skill_match": "...",\n'
            f'    "budget_fit": "..."\n'
            f"  }},\n"
            f"  {{\n"
            f'    "career": "Example Career Title 3",\n'
            f'    "description": "...",\n'
            f'    "skill_match": "...",\n'
            f'    "budget_fit": "..."\n'
            f"  }}\n"
            f"]\n\n"
            f"### YOUR RESPONSE ###\n"
            f"Generate 3 NEW career recommendations related to {', '.join(skills)} and {', '.join(interests)}. Output ONLY valid JSON:"
        )
        
        # Tokenize the input
        logger.info("Generating recommendations")
        input_text = prompt
        inputs = tokenizer(input_text, return_tensors="pt", truncation=True, max_length=512)
        
        # Generate output with improved parameters for better structured output
        try:
            logger.info("Starting model inference with optimized parameters for structured output...")
            outputs = model.generate(
                **inputs,
                max_length=1200,              # Extended max length for comprehensive responses
                min_length=500,               # Increased minimum to ensure complete content
                num_beams=6,                  # Balanced beam search
                no_repeat_ngram_size=2,       # Avoid repetition but not too restrictive
                do_sample=True,               # Enable sampling for more natural text
                temperature=0.3,              # Low temperature for more focused and predictable outputs
                top_p=0.95,                   # Allow for some diversity while staying on topic
                top_k=50,                     # Reasonable vocabulary diversity
                repetition_penalty=1.5,       # Strong penalty for repetition to avoid copying examples
                num_return_sequences=1,
                early_stopping=True,
                length_penalty=1.3            # Encourage detailed responses
            )
            logger.info("Model inference completed successfully")
        except RuntimeError as e:
            # Handle CUDA out of memory errors
            if "CUDA out of memory" in str(e):
                logger.warning("CUDA out of memory error, trying with smaller parameters")
                # Try again with smaller parameters but maintain structure
                outputs = model.generate(
                    **inputs,
                    max_length=600,          # Still allow for good detail
                    min_length=300,          # Ensure adequate content 
                    num_beams=4,             # Fewer beams to save memory
                    no_repeat_ngram_size=2,  # Avoid repetition
                    do_sample=True,          # Enable sampling for more natural text
                    temperature=0.3,         # Low temperature for focused outputs
                    top_p=0.95,              # Controlled diversity
                    repetition_penalty=1.3,  # Penalty for repetition
                    num_return_sequences=1,
                    early_stopping=True,
                    length_penalty=1.2       # Encourage detail
                )
            else:
                raise
        
        # Decode the output
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        logger.info(f"Generated raw text: {result}")
        
        # Log the raw text in chunks for better debugging
        chunk_size = 200
        for i in range(0, len(result), chunk_size):
            chunk = result[i:i+chunk_size]
            logger.debug(f"Raw text chunk {i//chunk_size + 1}: {chunk}")
        
        # Format and ensure valid JSON
        # Format raw text to JSON
        recommendations = format_to_json(result)
        logger.info(f"Formatted recommendations: {json.dumps(recommendations)}")
        
        # Post-process to ensure relevance to AI/ML/robotics domain
        processed_recommendations = validate_and_enhance_recommendations(recommendations, skills, interests)
        
        return processed_recommendations
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        logger.error(traceback.format_exc())
        return [{"career": "Error", "description": f"Failed to generate recommendations: {str(e)}"}]
# Global flag to track shutdown signal
shutdown_requested = False

# Handler for clean exit on signals
def signal_handler(sig, frame):
    global shutdown_requested
    logger.info(f"Received signal {sig}. Shutting down gracefully...")
    shutdown_requested = True
    # Exit with a successful status code
    sys.exit(0)

# Read input with timeout
def read_stdin_with_timeout(timeout=30):
    """Read from stdin with a timeout to prevent hanging indefinitely"""
    input_data = ""
    
    def read_input():
        nonlocal input_data
        try:
            input_data = sys.stdin.read()
        except Exception as e:
            logger.error(f"Error reading from stdin: {str(e)}")
    
    # Start a thread to read input
    input_thread = threading.Thread(target=read_input)
    input_thread.daemon = True  # Set as daemon so it doesn't block program exit
    input_thread.start()
    
    # Wait for the thread to complete or timeout
    input_thread.join(timeout)
    
    if input_thread.is_alive():
        logger.error(f"Timeout after {timeout} seconds waiting for input")
        return None
    
    return input_data

# Validate input data
def validate_input(input_data):
    """Validate input data structure and content"""
    if not isinstance(input_data, dict):
        return False, "Input must be a JSON object"
    
    # Check skills
    skills = input_data.get("skills", [])
    if not skills or not isinstance(skills, list) or len(skills) == 0:
        return False, "Skills must be a non-empty array"
    
    # Check interests
    interests = input_data.get("interests", [])
    if not interests or not isinstance(interests, list) or len(interests) == 0:
        return False, "Interests must be a non-empty array"
    
    # Check budget
    budget = input_data.get("budget", 0)
    if not isinstance(budget, (int, float)) or budget < 0:
        return False, "Budget must be a non-negative number"
    
    return True, None

if __name__ == "__main__":
    # Register signal handlers for clean exit
    try:
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        logger.info("Registered signal handlers for clean exit")
    except Exception as e:
        logger.warning(f"Failed to register signal handlers: {str(e)}")
    
    try:
        # First check if model was loaded properly
        if not model_loaded:
            logger.warning("Model was not loaded on startup, attempting one more load")
            if not load_model():
                error_msg = {"error": "Could not load the T5 model"}
                print(json.dumps([{"career": "Error", "description": "Failed to initialize the language model. Please check installation."}]))
                sys.stdout.flush()
                sys.exit(1)

        # Log PID and platform info for debugging
        logger.info(f"Process ID: {os.getpid()}, Platform: {sys.platform}")
        
        # Read input from Node.js via stdin with timeout
        logger.info("Waiting for input data...")
        input_str = read_stdin_with_timeout(60)  # 60 second timeout
        
        if input_str is None or not input_str.strip():
            logger.error("No input received or timeout occurred")
            print(json.dumps([{"career": "Error", "description": "No input received or timeout occurred. Please try again."}]))
            sys.stdout.flush()
            sys.exit(1)
            
        logger.info(f"Received input length: {len(input_str)} bytes")
        logger.info(f"Input preview: {input_str[:100]}{'...' if len(input_str) > 100 else ''}")
        
        try:
            input_data = json.loads(input_str)
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}, Input: {input_str[:50]}...")
            print(json.dumps([{"career": "Error", "description": f"Invalid JSON input: {str(e)}"}]))
            sys.stdout.flush()
            sys.exit(1)
            
        # Validate input structure and content
        is_valid, error_message = validate_input(input_data)
        if not is_valid:
            logger.error(f"Input validation failed: {error_message}")
            print(json.dumps([{"career": "Error", "description": error_message}]))
            sys.stdout.flush()
            sys.exit(1)
            
        # Extract data after validation
        skills = input_data.get("skills", [])
        interests = input_data.get("interests", [])
        budget = input_data.get("budget", 0)
        
        logger.info(f"Processing request with skills: {skills}, interests: {interests}, budget: {budget}")
        
        # Generate recommendations
        recommendations = generate_recommendations(skills, interests, budget)
        
        # Send the result back to Node.js via stdout
        output = json.dumps(recommendations)
        logger.info(f"Sending output length: {len(output)} bytes")
        logger.info(f"Output preview: {output[:100]}{'...' if len(output) > 100 else ''}")
        print(output)
        sys.stdout.flush()
        logger.info("Output sent successfully")
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        print(json.dumps([{"career": "Error", "description": f"Invalid JSON input: {str(e)}"}]))
        sys.stdout.flush()
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        print(json.dumps([{"career": "Error", "description": f"Unexpected error: {str(e)}"}]))
        sys.stdout.flush()
    
    finally:
        logger.info("Python process completed")
        # Ensure we exit cleanly
        if shutdown_requested:
            logger.info("Exiting due to shutdown request")
        sys.exit(0)
        logger.error(traceback.format_exc())
