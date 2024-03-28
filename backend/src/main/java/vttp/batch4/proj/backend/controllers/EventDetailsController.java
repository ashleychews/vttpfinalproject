package vttp.batch4.proj.backend.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vttp.batch4.proj.backend.models.EventDetails;
import vttp.batch4.proj.backend.services.EventDetailsService;


@RestController
@RequestMapping("/api")
public class EventDetailsController {

    @Autowired
    private EventDetailsService eventDSvc;

    @GetMapping("events/{id}")
    public List<EventDetails> getEventDetails(@PathVariable String id) {
        return eventDSvc.getEventDetails(id);
    }

    @GetMapping("/url")
    public ResponseEntity<String> getMapUrl(@RequestParam("name") String name, @RequestParam("address") String address) {
        String mapUrl = eventDSvc.getMapUrl(name, address);
        return ResponseEntity.ok().body(mapUrl);
    }

    
}
