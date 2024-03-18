package vttp.batch4.proj.backend.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vttp.batch4.proj.backend.models.Event;
import vttp.batch4.proj.backend.services.EventService;

@RestController
@RequestMapping("/api")
public class EventController {

    @Autowired
    private EventService eventSvc;

    //http://localhost:8080/api/events?countryCode=US
    @GetMapping("/events")
    public List<Event> getEventsByCountry(@RequestParam(required = false) String countryCode, 
    @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        if (countryCode != null) {
            return eventSvc.getEventsByCountry(page, size, countryCode);
        } else {
            return eventSvc.getAllEvents(page, size);
        }
    }

    @GetMapping("/lastPage")
    public int getLastPageNumber(@RequestParam String countryCode) {
        return eventSvc.getLastPageNumber(countryCode);
    }

    @GetMapping("/search")
    public List<Event> getEventsBySearch(@RequestParam String keyword,
    @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return eventSvc.getEventsBySearch(keyword, page, size);
    }


    
}
