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
import vttp.batch4.proj.backend.models.Event;

@Service
public class EventService {

    @Value("${ticketmasterapi.key}")
    private String apiKey;


    //https://app.ticketmaster.com/discovery/v2/events.json?apikey=?
    public List<Event> getAllEvents(int page, int size) {
        String payload;
        String url = buildUrl(page, size, null);

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

    //https://app.ticketmaster.com/discovery/v2/events.json?countryCode=?&apikey=?
    public List<Event> getEventsByCountry(int page, int size, String countryCode) {
        String payload;
        String url = buildUrl(page, size, countryCode);

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

    //https://app.ticketmaster.com/discovery/v2/events.json?keyword=?&apikey=?
    public List<Event> getEventsBySearch(String keyword, int page, int size) {

        String payload;
        String url = searchUrl(keyword, page, size);

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

    private String buildUrl(int page, int size, String countryCode) {
        return UriComponentsBuilder
                .fromUriString("https://app.ticketmaster.com/discovery/v2/events.json")
                .queryParam("countryCode", countryCode)
                .queryParam("page", page)
                .queryParam("size", size)
                .queryParam("apikey", apiKey)
                .toUriString();
    }

    private List<Event> parseEvents(String payload) {
        List<Event> eventList = new LinkedList<>();

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
            String type = event.getString("type", "");
            String id = event.getString("id", ""); 

            String imageUrl = "/resources/static/placeholder.png"; // Default placeholder image

            JsonArray images = event.getJsonArray("images");
            if (images != null && !images.isEmpty()) {
                JsonObject firstImage = images.getJsonObject(0);
                imageUrl = firstImage.getString("url");
            }


            // Retrieve event dates
            // Retrieve event dates
            JsonObject dates = event.getJsonObject("dates");
            if (dates != null) {
                JsonObject start = dates.getJsonObject("start");
                if (start != null) {
                    String localDate = start.getString("localDate", "");
                    String localTime = start.getString("localTime", "");
                    eventList.add(new Event(name, type, id, imageUrl, localDate, localTime));
                }
            }
    
        }
        return eventList;
    }


    private String searchUrl(String keyword, int page, int size) {

        return UriComponentsBuilder
        .fromUriString("https://app.ticketmaster.com/discovery/v2/events.json")
        .queryParam("keyword", keyword)
        .queryParam("page", page)
        .queryParam("size", size)
        .queryParam("apikey", apiKey)
        .toUriString();
    }

    public int getLastPageNumber(String countryCode) {
        String url = buildUrl(0, 20, countryCode); // Fetching the first page to get total pages
        RestTemplate template = new RestTemplate();
        ResponseEntity<String> resp;
        try {
            resp = template.exchange(url, HttpMethod.GET, null, String.class);
            String payload = resp.getBody();
            JsonReader reader = Json.createReader(new StringReader(payload));
            JsonObject result = reader.readObject();
            JsonObject page = result.getJsonObject("page");
            return page.getInt("totalPages", 0);
        } catch (Exception ex) {
            ex.printStackTrace();
            return 0; //default
        }
    }

}