import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserInput } from '../models/userModel.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL + '/test_db');
    console.log('Connected to MongoDB for testing');
  } catch (error) {
    console.error('MongoDB test connection error:', error);
    process.exit(1);
  }
};

// Test valid user creation
const testValidUser = async () => {
  try {
    const validUser = new UserInput({
      username: 'testuser123',
      password: 'TestPass123!',
      fullName: 'Test User',
      email: 'test@example.com',
      birthDate: new Date('1990-01-01'),
      location: {
        city: 'New York',
        state: 'NY',
        country: 'USA'
      },
      streetAddress: '123 Test St',
      educationLevel: "Bachelor's Degree",
      currentField: 'Computer Science',
      experience: 5,
      skills: ['JavaScript', 'React', 'Node.js'],
      interests: ['Web Development', 'AI'],
      budget: 5000
    });

    await validUser.save();
    console.log('✅ Valid user created successfully');
    
    // Test age calculation
    console.log(`Age calculation test: ${validUser.age} years old`);
    
    // Test safe user data method
    const safeData = validUser.getSafeUserData();
    console.log('Safe user data test:', safeData.password === undefined ? '✅ Password removed' : '❌ Password not removed');
    
    return validUser;
  } catch (error) {
    console.error('❌ Valid user test failed:', error.message);
    return null;
  }
};

// Test password validation
const testPasswordValidation = async () => {
  try {
    // Test weak password
    const weakPasswordUser = new UserInput({
      username: 'weakpassuser',
      password: 'weak',  // Too short, missing requirements
      fullName: 'Weak Password User',
      email: 'weak@example.com',
      location: {
        country: 'USA'
      },
      skills: ['Testing'],
      interests: ['Security'],
      budget: 1000
    });

    await weakPasswordUser.save();
    console.log('❌ Weak password test failed - validation should have prevented save');
  } catch (error) {
    console.log('✅ Weak password correctly rejected:', error.message);
  }
};

// Test email validation
const testEmailValidation = async () => {
  try {
    // Test invalid email
    const invalidEmailUser = new UserInput({
      username: 'emailtestuser',
      password: 'TestPass123!',
      fullName: 'Email Test User',
      email: 'not-an-email',  // Invalid email format
      location: {
        country: 'USA'
      },
      skills: ['Testing'],
      interests: ['Email'],
      budget: 1000
    });

    await invalidEmailUser.save();
    console.log('❌ Invalid email test failed - validation should have prevented save');
  } catch (error) {
    console.log('✅ Invalid email correctly rejected:', error.message);
  }
};

// Test skills and interests validation
const testSkillsInterestsValidation = async () => {
  try {
    // Test empty skills array
    const emptySkillsUser = new UserInput({
      username: 'emptyskillsuser',
      password: 'TestPass123!',
      fullName: 'Empty Skills User',
      email: 'skills@example.com',
      location: {
        country: 'USA'
      },
      skills: [],  // Empty array should fail validation
      interests: ['Testing'],
      budget: 1000
    });

    await emptySkillsUser.save();
    console.log('❌ Empty skills test failed - validation should have prevented save');
  } catch (error) {
    console.log('✅ Empty skills correctly rejected:', error.message);
  }
  
  try {
    // Test empty interests array
    const emptyInterestsUser = new UserInput({
      username: 'emptyinterestsuser',
      password: 'TestPass123!',
      fullName: 'Empty Interests User',
      email: 'interests@example.com',
      location: {
        country: 'USA'
      },
      skills: ['Testing'],
      interests: [],  // Empty array should fail validation
      budget: 1000
    });

    await emptyInterestsUser.save();
    console.log('❌ Empty interests test failed - validation should have prevented save');
  } catch (error) {
    console.log('✅ Empty interests correctly rejected:', error.message);
  }
};

// Test location validation
const testLocationValidation = async () => {
  try {
    // Test missing country (required field)
    const missingCountryUser = new UserInput({
      username: 'locationtestuser',
      password: 'TestPass123!',
      fullName: 'Location Test User',
      email: 'location@example.com',
      location: {
        city: 'Test City',
        state: 'Test State'
        // country is missing
      },
      skills: ['Testing'],
      interests: ['Geography'],
      budget: 1000
    });

    await missingCountryUser.save();
    console.log('❌ Missing country test failed - validation should have prevented save');
  } catch (error) {
    console.log('✅ Missing country correctly rejected:', error.message);
  }
};

// Clean up after tests
const cleanupTests = async (userId = null) => {
  try {
    if (userId) {
      await UserInput.findByIdAndDelete(userId);
    } else {
      await UserInput.deleteMany({
        username: { 
          $in: [
            'testuser123', 
            'weakpassuser', 
            'emailtestuser', 
            'emptyskillsuser', 
            'emptyinterestsuser', 
            'locationtestuser'
          ] 
        }
      });
    }
    console.log('Test data cleaned up');
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
};

// Run all tests
const runTests = async () => {
  await connectDB();
  console.log('\n===== STARTING USER MODEL TESTS =====\n');
  
  const validUser = await testValidUser();
  await testPasswordValidation();
  await testEmailValidation();
  await testSkillsInterestsValidation();
  await testLocationValidation();
  
  // Clean up test data
  await cleanupTests(validUser?._id);
  
  console.log('\n===== USER MODEL TESTS COMPLETED =====\n');
  
  // Disconnect from MongoDB
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

// Execute tests
runTests().catch(console.error);

