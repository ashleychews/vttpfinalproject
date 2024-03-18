package vttp.batch4.proj.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Venue {

    private String name;
    private String url;
    private String address;
    private String longitude;
    private String latitude;
    
}
