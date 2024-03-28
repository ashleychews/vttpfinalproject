package vttp.batch4.proj.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    private String name;
    private String id;
    private String imageUrl;
    private String localDate;
    private String localTime;
    
}
