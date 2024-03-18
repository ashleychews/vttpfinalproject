package vttp.batch4.proj.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDetails {

    private String name;
    private String eventUrl;
    private String imageUrl;
    private String localDate;
    private String localTime;
    private Venue venue;
    private String seatMapUrl;
    
}
