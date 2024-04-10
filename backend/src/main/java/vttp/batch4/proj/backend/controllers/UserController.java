package vttp.batch4.proj.backend.controllers;

import java.io.IOException;
import java.io.StringReader;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import vttp.batch4.proj.backend.exceptions.UserException;
import vttp.batch4.proj.backend.models.User;
import vttp.batch4.proj.backend.models.UserProfile;
import vttp.batch4.proj.backend.services.ImageService;
import vttp.batch4.proj.backend.services.UserService;
import org.springframework.http.MediaType;

@RestController
@CrossOrigin
@RequestMapping(path = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class UserController {

    @Autowired
    private UserService userSvc;

    @Autowired
    private ImageService imgSvc;

    @Autowired
    private AmazonS3 s3;

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
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error.toString());
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error.toString());
        }
    }

    @PostMapping("/user/createprofile")
    public ResponseEntity<String> createUserProfile(@RequestBody String payload)
            throws InterruptedException, UserException {
        try {
            // Generate a random seed
            String seed = String.valueOf(new Random().nextInt(100));

            // Generate a random image URL using an external API
            String imageUrl = "https://api.dicebear.com/8.x/avataaars-neutral/svg?seed=" + seed;
            System.out.println(imageUrl);

            String contentType = "image/svg+xml";

            // Save image URL to S3 and get the image ID
            String imageId = imgSvc.saveUrlToS3(imageUrl, contentType);

            JsonReader reader = Json.createReader(new StringReader(payload));
            JsonObject json = reader.readObject();

            UserProfile userP = new UserProfile();
            userP.setUserName(json.getString("userName"));
            userP.setFirstName(json.getString("firstName"));
            userP.setLastName(json.getString("lastName"));
            userP.setBirthDate(json.getString("birthdate"));
            userP.setPhoneNo(json.getString("phoneNumber"));
            userP.setEmail(json.getString("email"));
            userP.setCountry(json.getString("country")); 
            userP.setPictureId(imageId);
            userP.setMediaType(contentType);

            // System.out.println(userP);
            userSvc.createUserProfile(userP, imageId);

            JsonObject success = Json.createObjectBuilder()
                    .add("success", "User Profile created successfully")
                    .build();
            return ResponseEntity.ok().body(success.toString());
        } catch (IOException ex) {
            JsonObject error = Json.createObjectBuilder()
                    .add("error", "Failed to create User Profile")
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error.toString());
        }
    }

    // retrieve user profile
    @PostMapping("/profile")
    public ResponseEntity<UserProfile> retrieveUserProfile(@RequestBody Map<String, String> requestBody) {
        try {
            String email = requestBody.get("email");
            UserProfile userProfile = userSvc.getUserProfile(email);

            return ResponseEntity.ok().body(userProfile);
        } catch (UserException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // put mapping for updated user
    @PutMapping(path = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    // handles file upload
    public ResponseEntity<String> updateUserProfile(@RequestPart(required = false) MultipartFile image,
            @RequestPart String email, @RequestPart String userName, @RequestPart String firstName,
            @RequestPart String lastName, @RequestPart String birthDate,
            @RequestPart String phoneNo, @RequestPart String joinedDate, @RequestPart String country) {
        try {
            UserProfile updatedProfile = new UserProfile();

            if (image != null) {
                String id = imgSvc.saveToS3(image);
                updatedProfile.setPictureId(id);
                updatedProfile.setMediaType(image.getContentType());
            } else {
                // Retrieve the current user profile to get the existing picture ID
                UserProfile existingUserProfile = userSvc.getUserProfile(email);
                updatedProfile.setPictureId(existingUserProfile.getPictureId());
                updatedProfile.setMediaType(existingUserProfile.getMediaType());
            }

            updatedProfile.setUserName(userName);
            updatedProfile.setFirstName(firstName);
            updatedProfile.setLastName(lastName);
            updatedProfile.setBirthDate(birthDate);
            updatedProfile.setPhoneNo(phoneNo);
            updatedProfile.setJoinedDate(joinedDate);
            updatedProfile.setCountry(country);
            updatedProfile.setEmail(email);

            System.out.println(updatedProfile);
            // Save the updated profile
            UserProfile updatedUserProfile = userSvc.updateUserProfile(updatedProfile);

            // Construct JSON object with updated profile data
            JsonObject updatedProfileJson = Json.createObjectBuilder()
                    .add("email", updatedUserProfile.getEmail())
                    .add("userName", updatedUserProfile.getUserName())
                    .add("firstName", updatedUserProfile.getFirstName())
                    .add("lastName", updatedUserProfile.getLastName())
                    .add("birthDate", updatedUserProfile.getBirthDate())
                    .add("phoneNo", updatedUserProfile.getPhoneNo())
                    .add("pictureId", updatedProfile.getPictureId())
                    .add("country", updatedUserProfile.getCountry())
                    .add("joinedDate", updatedUserProfile.getJoinedDate())
                    .build();
            return ResponseEntity.ok().body(updatedProfileJson.toString());

        } catch (UserException ex) {
            JsonObject error = Json.createObjectBuilder()
                    .add("error", "Failed to update user profile")
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error.toString());
        }
    }

    @GetMapping("/image/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable String id) {
        try {
            GetObjectRequest getReq = new GetObjectRequest("tixbuds", "images/%s".formatted(id));

            S3Object obj = s3.getObject(getReq);
            S3ObjectInputStream is = obj.getObjectContent();
            byte[] imageData = is.readAllBytes();

            // Get the content type from S3 object metadata
            ObjectMetadata metadata = obj.getObjectMetadata();
            String contentType = metadata.getContentType();

            // Parse the content type string to MediaType object
            MediaType mediaType = MediaType.parseMediaType(contentType);

            return ResponseEntity.ok()
                    .contentType(mediaType) // Set the correct content type
                    .body(imageData);
        } catch (Exception e) {
            // Handle other exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
