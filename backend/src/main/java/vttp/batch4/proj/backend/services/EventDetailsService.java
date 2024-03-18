package vttp.batch4.proj.backend.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class EventDetailsService {

    @Value("${ticketmasterapi.key}")
    private String apiKey;

    


    private String buildUrl(int page, int size, String id) {
        return UriComponentsBuilder
                .fromUriString("https://app.ticketmaster.com/discovery/v2/events.json")
                .queryParam("id", id)
                .queryParam("page", page)
                .queryParam("size", size)
                .queryParam("apikey", apiKey)
                .toUriString();
    }
    
}
