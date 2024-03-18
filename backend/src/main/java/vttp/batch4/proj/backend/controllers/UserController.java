package vttp.batch4.proj.backend.controllers;

import java.io.StringReader;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import vttp.batch4.proj.backend.exceptions.UserException;
import vttp.batch4.proj.backend.models.User;
import vttp.batch4.proj.backend.models.UserProfile;
import vttp.batch4.proj.backend.services.UserService;
import org.springframework.http.MediaType;

@RestController
@RequestMapping(path="/api",  produces = MediaType.APPLICATION_JSON_VALUE)
public class UserController {

    @Autowired
    private UserService userSvc;

    @PostMapping("/login")
    public ResponseEntity<String> userLogin(@RequestBody User user) {
        try {
            Optional<User> loginUser = userSvc.loginUser(user.getEmail(), user.getPassword());
            if (loginUser.isPresent()) {
                JsonObject success = Json.createObjectBuilder()
                    .add("success", true)
                    .build();
                return ResponseEntity.ok().body(success.toString());
            } else {
                JsonObject error = Json.createObjectBuilder()
                    .add("error", "Invalid credentials")
                    .build();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error.toString());
            }
        } catch (UserException ex) {
            JsonObject err = Json.createObjectBuilder()
                .add("error", ex.getMessage())
                .build();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err.toString());
        }
    }


    @PostMapping("/register")
    public ResponseEntity<String> userRegister(@RequestBody User user) {
        try {
            Optional<User> newUser = userSvc.saveUser(user);
            if (newUser.isPresent()) {
                JsonObject success = Json.createObjectBuilder()
                    .add("success", true)
                    .build();
                return ResponseEntity.ok().body(success.toString());
            } else {
                JsonObject error = Json.createObjectBuilder()
                    .add("error", "User already exists")
                    .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error.toString());
            }
        } catch (UserException ex) {
            JsonObject error = Json.createObjectBuilder()
                .add("error", "Failed to register user")
                .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error.toString());
        } catch (Exception ex) {
            JsonObject error = Json.createObjectBuilder()
                .add("error", "error")
                .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error.toString());
        }
    }

    @PostMapping("/user/createprofile")
    public ResponseEntity<String> createUserProfile(@RequestBody String payload) {
        try {
            JsonReader reader = Json.createReader(new StringReader(payload));
            JsonObject json = reader.readObject();

            UserProfile userP = new UserProfile();
            userP.setFirstName(json.getString("firstName"));
            userP.setLastName(json.getString("lastName"));
            userP.setBirthDate(json.getString("birthdate"));
            userP.setPhoneNo(json.getString("phoneNumber"));
            userP.setEmail(json.getString("email"));
            userSvc.createUserProfile(userP);

            JsonObject success = Json.createObjectBuilder()
                .add("success", "User Profile created successfully")
                .build();
            return ResponseEntity.ok().body(success.toString());
        } catch (UserException ex) {
            JsonObject error = Json.createObjectBuilder()
                .add("error", "Failed to create User Profile")
                .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error.toString());
        }
    }

@PostMapping("/profile") 
public ResponseEntity<String> retrieveUserProfile(@RequestBody Map<String, String> requestBody) {
    try {
        String email = requestBody.get("email");
        UserProfile userProfile = userSvc.getUserProfile(email);

        JsonObject obj = Json.createObjectBuilder()
            .add("email", userProfile.getEmail())
            .add("firstname", userProfile.getFirstName())
            .add("lastname", userProfile.getLastName())
            .add("birthdate", userProfile.getBirthDate())
            .add("phoneNo", userProfile.getPhoneNo())
            .build();
        
        System.out.println(obj);
        return ResponseEntity.ok().body(obj.toString());
    } catch (UserException ex) {
        JsonObject error = Json.createObjectBuilder()
            .add("error", "Failed to retrieve user profile")
            .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error.toString());
    }
}

    //put mapping for updated user
    @PutMapping("/profile")
    public ResponseEntity<String> updateUserProfile(@RequestBody UserProfile updatedProfile) {
        try {
            // Retrieve the existing user profile
            UserProfile existingProfile = userSvc.getUserProfile(updatedProfile.getEmail());
        
            // Update the existing profile with data from the updated profile
            existingProfile.setFirstName(updatedProfile.getFirstName());
            existingProfile.setLastName(updatedProfile.getLastName());
            existingProfile.setBirthDate(updatedProfile.getBirthDate());
            existingProfile.setPhoneNo(updatedProfile.getPhoneNo());
        
            // Save the updated profile
            userSvc.updateProfile(existingProfile);

            JsonObject success = Json.createObjectBuilder()
                .add("success", true)
                .build();
        return ResponseEntity.ok().body(success.toString());

        } catch (UserException ex) {
            JsonObject error = Json.createObjectBuilder()
                .add("error", "Failed to update user profile")
                .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error.toString());
        }
    }


}
