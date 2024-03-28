package vttp.batch4.proj.backend.services;

import java.io.StringReader;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.json.JsonValue;
import vttp.batch4.proj.backend.models.EventDetails;
import vttp.batch4.proj.backend.models.Venue;

@Service
public class EventDetailsService {

    @Value("${ticketmasterapi.key}")
    private String apiKey;

    @Value("${googleapi.key}")
    private String googleKey;

    //https://app.ticketmaster.com/discovery/v2/events.json?apikey=?
    public List<EventDetails> getEventDetails(String id) {
        String payload;
        String url = buildUrl(id);

        RestTemplate template = new RestTemplate();
        ResponseEntity<String> resp;
        try {
            resp = template.exchange(url, HttpMethod.GET, null, String.class);
            payload = resp.getBody();
        } catch (Exception ex) {
            ex.printStackTrace();
            return Collections.emptyList();
        }
        return parseEvents(payload);
    }

    //https://app.ticketmaster.com/discovery/v2/events.json?id=?&apikey=?
    private String buildUrl(String id) {
        return UriComponentsBuilder
                .fromUriString("https://app.ticketmaster.com/discovery/v2/events.json")
                .queryParam("id", id)
                .queryParam("apikey", apiKey)
                .toUriString();
    }

    private List<EventDetails> parseEvents(String payload) {
        List<EventDetails> eventList = new LinkedList<>();

        if (payload == null || payload.isEmpty()) {
            return eventList;
        }

        JsonReader reader = Json.createReader(new StringReader(payload));
        JsonObject result = reader.readObject();
        JsonObject embedded = result.getJsonObject("_embedded");

        if (embedded == null || embedded.isEmpty()) {
            return eventList;
        }

        JsonArray events = embedded.getJsonArray("events");

        if (events == null || events.isEmpty()) {
            return eventList;
        }

        for (JsonValue value : events) {
            JsonObject event = (JsonObject) value;
            String name = event.getString("name", "");
            String eventUrl = event.getString("url", "");

            //image
            String imageUrl = "/resources/static/placeholder.png"; // Default placeholder image
            JsonArray images = event.getJsonArray("images");
            if (images != null && !images.isEmpty()) {
                JsonObject firstImage = images.getJsonObject(0);
                imageUrl = firstImage.getString("url");
            }

            JsonObject seatmap = event.getJsonObject("seatmap");
            String seatmapUrl = null;
            if (seatmap !=null) {
                seatmapUrl = seatmap.getString("staticUrl", "");
            }

            // Retrieve event dates
            JsonObject dates = event.getJsonObject("dates");
            if (dates != null) {
                JsonObject start = dates.getJsonObject("start");
                if (start != null) {
                    String localDate = start.getString("localDate", "");
                    String localTime = start.getString("localTime", "");
                    // Parse venue
                    JsonObject venueJson = event.getJsonObject("_embedded").getJsonArray("venues").getJsonObject(0);
                    String venueName = venueJson.getString("name", "");
                    String venueUrl = venueJson.getString("url", "");
                    String address = venueJson.getJsonObject("address").getString("line1", "");
                    Venue venue = new Venue(venueName, venueUrl, address);

                    eventList.add(new EventDetails(name, eventUrl, imageUrl, localDate, localTime, venue, seatmapUrl));
                }
            }
    
        }
        return eventList;
    }

    //google
    public String getMapUrl(String name, String address) {
        // Concatenate the venue name and address with a comma and encode them properly
        String queryParamValue = name + "," + address;
        
        return UriComponentsBuilder
            .fromUriString("https://www.google.com/maps/embed/v1/place")
            .queryParam("key", googleKey)
            .queryParam("q", queryParamValue)
            .toUriString();
    }

    //   https://www.google.com/maps/embed/v1/view
    //   ?key=YOUR_API_KEY
    //   &center=-33.8569,151.2152
    //   &zoom=18
    //   &maptype=satellite
    // public String getMapUrl(String longitude, String latitude) {
    //     return UriComponentsBuilder
    //             .fromUriString("https://www.google.com/maps/embed/v1/view")
    //             .queryParam("key", googleKey)
    //             .queryParam("center", longitude + "," + latitude)
    //             .queryParam("zoom", 18)
    //             .queryParam("maptype", "satellite")
    //             .toUriString();
    // }

    
}