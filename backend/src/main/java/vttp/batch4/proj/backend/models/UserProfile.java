package vttp.batch4.proj.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    private String email;
    private String userName;
    private String firstName;
    private String lastName;
    private String birthDate;
    private String phoneNo;
    private String pictureId;
    private String mediaType;
    
}