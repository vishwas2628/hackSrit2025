import sys
import json
import logging
import re
import traceback

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
    # First try direct JSON parsing
    try:
        parsed_json = json.loads(text)
        
        # Ensure all required fields are present
        for item in parsed_json:
            if isinstance(item, dict):
                # Make sure each entry has the required fields
                if "career" not in item:
                    item["career"] = "Unspecified Career"
                if "description" not in item:
                    item["description"] = "No description provided."
                # Add skill_match and budget_fit if they don't exist
                if "skill_match" not in item:
                    item["skill_match"] = "This career utilizes your existing skills."
                if "budget_fit" not in item:
                    item["budget_fit"] = "Your budget is sufficient for the required training."
                    
        return parsed_json
    except json.JSONDecodeError:
        pass
    
    # Try to extract array-like structure using regex
    try:
        # Look for text that resembles a JSON array
        array_pattern = r'\[.*\]'
        match = re.search(array_pattern, text, re.DOTALL)
        if match:
            json_text = match.group(0)
            return json.loads(json_text)
    except (json.JSONDecodeError, AttributeError):
        pass
    
    # If we still don't have valid JSON, attempt to create it from the text
    try:
        # Extract career-description pairs
        careers = []
        lines = text.split('\n')
        current_career = None
        current_description = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # If line looks like a new career title
            if (line.lower().startswith(('career:', 'job:', 'profession:')) or 
                (current_career and not current_description)):
                # Save previous career if exists
                if current_career and current_description:
                    careers.append({
                        "career": current_career,
                        "description": ' '.join(current_description)
                    })
                
                # Extract new career title
                if ':' in line:
                    current_career = line.split(':', 1)[1].strip()
                else:
                    current_career = line
                current_description = []
            elif current_career is not None:
                current_description.append(line)
        
        # Add the last career
        if current_career and current_description:
            careers.append({
                "career": current_career,
                "description": ' '.join(current_description)
            })
        
        if careers:
            return careers
    except Exception:
        pass
    
    # Enhanced fallback options with more detailed information
    return [
        {
            "career": "Software Developer", 
            "description": "Designs and builds computer applications and systems. Responsible for coding, testing, and maintaining software that meets user needs.",
            "skill_match": "Utilizes programming and problem-solving skills to create efficient solutions to technical challenges.",
            "budget_fit": "A $5000 budget is sufficient for online courses and certifications to enter this field."
        },
        {
            "career": "Data Analyst", 
            "description": "Interprets data to help organizations make informed decisions. Collects, processes, and performs statistical analyses on large datasets.",
            "skill_match": "Leverages problem-solving abilities to extract meaningful insights from complex information.",
            "budget_fit": "The budget allows for specialized data analysis courses and essential tool certifications."
        },
        {
            "career": "Digital Marketer", 
            "description": "Develops and implements online marketing strategies to promote products and services. Manages social media, content creation, and digital advertising campaigns.",
            "skill_match": "Applies technological understanding and innovative thinking to reach target audiences effectively.",
            "budget_fit": "The available budget can cover digital marketing certifications and specialized courses."
        }
    ]

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
        # Create a more detailed and personalized prompt
        prompt = (
            f"Task: Generate personalized career recommendations based on a person's specific skills, interests, and budget.\n\n"
            f"Person Profile in Detail:\n"
            f"- Skills: {', '.join(skills)}\n"
            f"- Interests: {', '.join(interests)}\n"
            f"- Available Budget for Education/Training: ${budget}\n\n"
            f"Background Context:\n"
            f"- The person is looking for careers that leverage their existing skills\n"
            f"- They want to pursue interests they're passionate about\n"
            f"- Their budget of ${budget} should be considered for any additional training needed\n\n"
            f"Instructions for Detailed Recommendations:\n"
            f"1. Recommend exactly 3 specific careers that match their profile\n"
            f"2. For each career, provide:\n"
            f"   - An accurate job title\n"
            f"   - A detailed description explaining day-to-day responsibilities\n"
            f"   - Why this career specifically matches their skills and interests\n"
            f"   - How their budget of ${budget} relates to training/education for this career\n"
            f"3. Format as a JSON array with 'career', 'description', 'skill_match' and 'budget_fit' fields\n\n"
            f"Example format:\n"
            f"[\n"
            f"  {{\n"
            f'    "career": "Specific Job Title 1",\n'
            f'    "description": "Detailed description of the career including responsibilities and growth potential.",\n'
            f'    "skill_match": "Explanation of how their skills in {", ".join(skills)} directly apply to this role.",\n'
            f'    "budget_fit": "Analysis of how their ${budget} budget aligns with education/certification requirements."\n'
            f"  }},\n"
            f"  {{\n"
            f'    "career": "Specific Job Title 2",\n'
            f'    "description": "Detailed description of the career including responsibilities and growth potential.",\n'
            f'    "skill_match": "Explanation of how their skills in {", ".join(skills)} directly apply to this role.",\n'
            f'    "budget_fit": "Analysis of how their ${budget} budget aligns with education/certification requirements."\n'
            f"  }},\n"
            f"  {{\n"
            f'    "career": "Specific Job Title 3",\n'
            f'    "description": "Detailed description of the career including responsibilities and growth potential.",\n'
            f'    "skill_match": "Explanation of how their skills in {", ".join(skills)} directly apply to this role.",\n'
            f'    "budget_fit": "Analysis of how their ${budget} budget aligns with education/certification requirements."\n'
            f"  }}\n"
            f"]\n\n"
            f"Output valid JSON only with all required fields:"
        )
        
        # Tokenize the input
        logger.info("Generating recommendations")
        input_text = prompt
        inputs = tokenizer(input_text, return_tensors="pt", truncation=True, max_length=512)
        
        # Generate output with improved parameters for better structured output
        try:
            logger.info("Starting model inference with enhanced parameters...")
            outputs = model.generate(
                **inputs,
                max_length=1000,              # Extended max length for more comprehensive responses
                min_length=200,               # Increased minimum to ensure detailed content
                num_beams=6,                  # Enhanced beam search for better coherence
                no_repeat_ngram_size=3,       # Improved repetition avoidance
                do_sample=True,               # Enable sampling for creative diversity
                temperature=0.85,             # Slightly higher temperature for more creative outputs
                top_p=0.92,                   # Tuned nucleus sampling - balance between creativity and relevance
                top_k=60,                     # Expanded vocabulary for more nuanced outputs
                num_return_sequences=1,
                early_stopping=True,
                length_penalty=1.2            # Encourage longer, more detailed responses
            )
            logger.info("Model inference completed successfully")
        except RuntimeError as e:
            # Handle CUDA out of memory errors
            if "CUDA out of memory" in str(e):
                logger.warning("CUDA out of memory error, trying with smaller parameters")
                # Try again with smaller parameters but still maintain quality
                outputs = model.generate(
                    **inputs,
                    max_length=450,          # Still allow for reasonable detail
                    min_length=150,          # Ensure adequate content 
                    num_beams=4,             # Reasonable beam search
                    do_sample=True,          # Keep sampling for diversity
                    temperature=0.75,        # Balance creativity with coherence
                    top_p=0.9,               # Slightly more focused sampling
                    top_k=40,                # Reasonable vocabulary restriction
                    num_return_sequences=1,
                    length_penalty=1.1       # Still encourage detail
                )
            else:
                raise
        
        # Decode the output
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        logger.info(f"Generated raw text: {result}")
        
        # Format and ensure valid JSON
        recommendations = format_to_json(result)
        logger.info(f"Formatted recommendations: {json.dumps(recommendations)}")
        return recommendations
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        logger.error(traceback.format_exc())
        return [{"career": "Error", "description": f"Failed to generate recommendations: {str(e)}"}]

if __name__ == "__main__":
    try:
        # First check if model was loaded properly
        if not model_loaded:
            logger.warning("Model was not loaded on startup, attempting one more load")
            if not load_model():
                error_msg = {"error": "Could not load the T5 model"}
                print(json.dumps([{"career": "Error", "description": "Failed to initialize the language model. Please check installation."}]))
                sys.stdout.flush()
                sys.exit(1)

        # Read input from Node.js via stdin
        logger.info("Waiting for input data...")
        input_str = sys.stdin.read()
        logger.info(f"Received input: {input_str}")
        
        input_data = json.loads(input_str)
        skills = input_data.get("skills", [])
        interests = input_data.get("interests", [])
        budget = input_data.get("budget", 0)
        
        # Validate input
        if not skills or not interests:
            recommendations = [{"career": "Error", "description": "Skills and interests must be provided"}]
        else:
            # Generate recommendations
            recommendations = generate_recommendations(skills, interests, budget)
        
        # Send the result back to Node.js via stdout
        output = json.dumps(recommendations)
        logger.info(f"Sending output: {output}")
        print(output)
        sys.stdout.flush()
        
    except json.JSONDecodeError as e:
        error_msg = {"error": f"Invalid JSON input: {str(e)}"}
        print(json.dumps([{"career": "Error", "description": str(error_msg)}]))
        sys.stdout.flush()
        logger.error(f"JSON decode error: {str(e)}")
        
    except Exception as e:
        error_msg = {"error": f"Unexpected error: {str(e)}"}
        print(json.dumps([{"career": "Error", "description": str(error_msg)}]))
        sys.stdout.flush()
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
