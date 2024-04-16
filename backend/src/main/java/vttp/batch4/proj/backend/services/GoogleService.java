package vttp.batch4.proj.backend.services;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Collection;
import java.util.HashSet;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.api.client.auth.oauth2.AuthorizationCodeRequestUrl;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets.Details;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;

@Service
public class GoogleService {

    @Value("${google.client.id}")
    private String id;

    @Value("${google.client.secret}")
    private String secret;

    @Value("${google.client.redirecturi}")
    private String redirect;

    private static final String APPLICATION_NAME = "tixbuds";
    private static HttpTransport httpTransport;
    private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
    private static Calendar client;

    GoogleClientSecrets googleClientSecrets;
    GoogleAuthorizationCodeFlow flow;
    Credential credential;

    public String authorize() throws Exception {
        AuthorizationCodeRequestUrl authorizationUrl;
        if (flow == null) {
            Details web = new Details();
            web.setClientId(id);
            web.setClientSecret(secret);
            googleClientSecrets = new GoogleClientSecrets().setWeb(web);
            httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            Collection<String> scopes = new HashSet<>();
            scopes.add(CalendarScopes.CALENDAR);
            scopes.add(CalendarScopes.CALENDAR_EVENTS);
            flow = new GoogleAuthorizationCodeFlow.Builder(httpTransport, JSON_FACTORY, googleClientSecrets,
                    scopes).build();
        }
        authorizationUrl = flow.newAuthorizationUrl().setRedirectUri(redirect);
        return authorizationUrl.build();
    }

    public boolean getToken(String code) {
        try {
            // get response
            TokenResponse response = flow.newTokenRequest(code).setRedirectUri(redirect).execute();
            System.out.println("token" + response);
            // user credentials
            credential = flow.createAndStoreCredential(response, "");

            client = new Calendar.Builder(httpTransport, JSON_FACTORY, credential).setApplicationName(APPLICATION_NAME)
                    .build();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public void setCalendarEvent(String title, String startDate, String endDate) throws Exception {
        // Define the formatter without seconds component
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
        DateTimeFormatter endFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

        try {
            // Parse the input date-time string using the formatter
            LocalDateTime inputDateTime = LocalDateTime.parse(startDate, formatter);
            LocalDateTime inputEndDateTime = LocalDateTime.parse(endDate, endFormatter);

            // Convert the LocalDateTime to Instant for further processing if needed
            Instant startInstant = inputDateTime.atZone(ZoneOffset.UTC).toInstant();
            Instant endInstant = inputEndDateTime.atZone(ZoneOffset.UTC).toInstant();

            long startMillis = startInstant.toEpochMilli();
            long endMillis = endInstant.toEpochMilli();

            com.google.api.client.util.DateTime startDateDateTime = new com.google.api.client.util.DateTime(
                    startMillis);
            com.google.api.client.util.DateTime endDateDateTime = new com.google.api.client.util.DateTime(endMillis);
            EventDateTime eventStart = new EventDateTime().setDateTime(startDateDateTime);
            EventDateTime eventEnd = new EventDateTime().setDateTime(endDateDateTime);

            Event event = new Event();
            event.setSummary(title);
            event.setStart(eventStart);
            event.setEnd(eventEnd);

            client.events().insert("primary", event).execute();
        } catch (DateTimeParseException e) {
            e.printStackTrace();
            throw new Exception("Error parsing date-time string: " + e.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            throw ex;
        }
    }

    public String getVerifyPassUrl() {
        return "/api/oauth2/pass";
    }

    public String getVerifyFailUrl() {
        return "/api/oauth2/fail";
    }

}