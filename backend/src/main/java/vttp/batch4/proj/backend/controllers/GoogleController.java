package vttp.batch4.proj.backend.controllers;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import vttp.batch4.proj.backend.services.GoogleService;

@Controller
@ResponseBody
@CrossOrigin
@RequestMapping("/api")
public class GoogleController {

    @Autowired
    private GoogleService googleSvc;

    String code;

    @GetMapping("/auth")
    public ResponseEntity<String> googleSendAuth() throws Exception {
        JsonObject json = Json.createObjectBuilder().add("authorize", googleSvc.authorize()).build();
        System.out.println(json);
        return ResponseEntity.ok(json.toString());
    }

    // redirect view so can hide the code
    @GetMapping("/auth/callback")
    public RedirectView redirectView(@RequestParam Map<String, String> param) {
        code = param.get("code");
        System.out.println(code);
        if (!code.isBlank()) {
            String passURL = googleSvc.getVerifyPassUrl();
            return new RedirectView(passURL);
        }

        else {
            String failURL = googleSvc.getVerifyFailUrl();
            return new RedirectView(failURL);
        }
    }

    @PostMapping("/calendar/event")
    public ResponseEntity<String> addCalendarEvent(@RequestBody Map<String, String> requestBody) {
        String title = requestBody.get("title");
        String startDateStr = requestBody.get("startDate");

        try {
            // check if token is available before calling setCalendarEvent
            if (googleSvc.getToken(code)) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
                LocalDateTime startDate = LocalDateTime.parse(startDateStr, formatter);
                // Calculate end date as end of the day for the start date
                LocalDateTime endDate = startDate.with(LocalTime.MAX).withNano(0); // Set time to end of the day
                System.out.println(startDate.toString());
                System.out.println(endDate.toString());

                googleSvc.setCalendarEvent(title, startDate.toString(), endDate.toString()); // Pass endDate

                JsonObject success = Json.createObjectBuilder()
                    .add("success", "Event added to Google Calendar successfully")
                    .build();

                return ResponseEntity.ok(success.toString());
            } else {
                // token retrieval failure
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error retrieving or refreshing access token.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding event to Google Calendar: " + e.getMessage());
        }

    }

    @GetMapping("/oauth2/verify")
    public ResponseEntity<String> oauth2Callback() {

        if (code != null) {
            JsonObject authorizationStatus = Json.createObjectBuilder().add("authorizationStatus", true).build();

            boolean status = googleSvc.getToken(code);
            System.out.println(status);

            return ResponseEntity.ok().body(authorizationStatus.toString());
        }

        else {
            JsonObject authorizationStatus = Json.createObjectBuilder().add("authorizationStatus", false).build();
            return ResponseEntity.badRequest().body(authorizationStatus.toString());
        }
    }

    // VIEWS
    @GetMapping(value = "/oauth2/fail")
    public ResponseEntity<String> verifyFail() {
        return ResponseEntity.ok().body("Authentication Failed :( ");
    }

    @GetMapping(value = "/oauth2/pass")
    public ResponseEntity<String> verifyPass() {
        return ResponseEntity.ok().body("Authentication Passed! Close this page and redirect back to tixbuds");
    }
}
