package vttp.batch4.proj.backend.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import vttp.batch4.proj.backend.exceptions.UserException;
import vttp.batch4.proj.backend.models.User;
import vttp.batch4.proj.backend.models.UserProfile;
import vttp.batch4.proj.backend.repositories.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    public Optional<User> saveUser(User user) throws UserException {

        try {
            Optional<User> opt = userRepo.userExists(user.getEmail());
            if (opt.isEmpty()) {
                User create = new User(user.getId(), user.getUsername(), user.getEmail(), user.getPassword());
                userRepo.saveUser(create);
                return Optional.of(create);
            } else {
                return Optional.empty(); //user already exists
            }
        } catch (Exception ex) {
            throw new UserException(ex.getMessage());
        }

    }

    public Optional<User> loginUser(String email, String password) throws UserException {
        try {
            Optional<User> opt = userRepo.userExists(email);
            if (opt.isPresent()) {
                User user = opt.get();
                // Check if the password matches the user's password
                if (user.getPassword().equals(password)) {
                    return Optional.of(user);
                } else {
                    return Optional.empty(); // Password doesn't match
                }
            } else {
                return Optional.empty(); // user with the email doesn't exist
            }
        } catch (Exception ex) {
            throw new UserException("Failed to login user: " + ex.getMessage());
        }
    }

    //create user profile
    public Optional<UserProfile> createUserProfile(UserProfile userProfile) throws UserException {
        try {
            // Check if the user exists before creating the profile
            Optional<User> existingUser = userRepo.userExists(userProfile.getEmail());
            if (existingUser.isPresent()) {
                // Save the user profile
                userRepo.saveUserProfile(userProfile);
                return Optional.of(userProfile);
            } else {
                throw new UserException("User with email " + userProfile.getEmail() + " does not exist.");
            }
        } catch (Exception ex) {
            throw new UserException("Failed to create user profile: " + ex.getMessage());
        }
    }

    //get user profile
    public UserProfile getUserProfile(String email) throws UserException {
        try {
            Optional<User> existingUser = userRepo.userExists(email);
            if (existingUser.isPresent()) {
                return userRepo.getUserProfile(email);
            } else {
                return new UserProfile();
            }
        } catch (Exception ex) {
            throw new UserException("Failed to get user profile: " + ex.getMessage());
        }
    }

    //updating user profile
    public UserProfile updateProfile(UserProfile uprofile) throws UserException {
        try {
            Optional<User> existingUser = userRepo.userExists(uprofile.getEmail());
            if (existingUser.isPresent()) {
                userRepo.updateUserProfile(uprofile);
                return new UserProfile(uprofile.getEmail(), uprofile.getFirstName(), uprofile.getLastName(), uprofile.getBirthDate(), uprofile.getPhoneNo());
            } else {
                return new UserProfile();
            }
        } catch (Exception ex) {
            throw new UserException("Failed to update user profile: " + ex.getMessage());
        }
    }

    
}
