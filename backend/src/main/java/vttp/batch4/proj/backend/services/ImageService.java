package vttp.batch4.proj.backend.services;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.PutObjectResult;

@Service
public class ImageService {

    @Autowired
    private AmazonS3 s3;

    public String saveUrlToS3(String imageUrl, String contentType) throws IOException, InterruptedException {
        System.out.println("Fetching image from URL: " + imageUrl);
        // Create HTTP client
        HttpClient client = HttpClient.newHttpClient();
    
        // Create HTTP request
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(imageUrl))
                .build();
        System.out.println("Sending HTTP request...");
        // Send HTTP request and retrieve response
        HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
    
        // Check if response is successful
        System.out.println("Response status code: " + response.statusCode());
        if (response.statusCode() != 200) {
            throw new IOException("Failed to fetch image from URL: " + imageUrl);
        }
        System.out.println("Image fetched successfully.");
    
        // Get the input stream from the response
        InputStream is = response.body();
    
        // Calculate the content length of the input stream
        int contentLength = calculateContentLength(is);
        System.out.println("Content length calculated: " + contentLength);
    
        // Close the original input stream as we cannot reset it
        is.close();
    
        // Create a byte array to store the input stream data
        byte[] imageData = new byte[contentLength];
    
        // Re-fetch the image from the URL and read it into the byte array
        is = client.send(request, HttpResponse.BodyHandlers.ofInputStream()).body();
        is.read(imageData);
    
        // Create a new input stream from the stored bytes
        ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(imageData);
    
        // Create metadata with content type and content length
        ObjectMetadata metadata = new ObjectMetadata();
        Map<String, String> mydata = new HashMap<>();

        mydata.put("name", "fred");
        metadata.setContentType(contentType);
        metadata.setContentLength(contentLength);
        metadata.setUserMetadata(mydata);
    
        System.out.println("Metadata created with content type: " + contentType + " and content length: " + contentLength);
    
        // Generate a unique ID for the S3 object key
        String id = UUID.randomUUID().toString().substring(0, 8);
    
        // Upload input stream to S3 bucket
        System.out.println("Uploading image to S3 bucket...");
        PutObjectRequest putReq = new PutObjectRequest(
                "tixbuds", // bucket name
                "images/" + id, // key
                byteArrayInputStream, metadata
        ).withCannedAcl(CannedAccessControlList.PublicRead);
    
        PutObjectResult result = s3.putObject(putReq);
        System.out.println("Image uploaded successfully to S3.");
    
        return id;
    }
    

    public int calculateContentLength(InputStream is) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] data = new byte[8192]; // Buffer size for reading data
        int bytesRead;
        
        // Read bytes from the input stream and write them to the buffer
        while ((bytesRead = is.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, bytesRead);
        }
        
        // Close the input stream
        is.close();
        
        // Calculate the content length from the buffer size
        return buffer.size();
    }

    // for image upload via file
    public String saveToS3(MultipartFile file) {
        ObjectMetadata metadata = new ObjectMetadata();
        Map<String, String> mydata = new HashMap<>();

        mydata.put("name", "fred");
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());
        metadata.setUserMetadata(mydata);

        String id = UUID.randomUUID().toString().substring(0, 8);

        try {
            PutObjectRequest putReq = new PutObjectRequest(
                    "tixbuds" // bucket name
                    , "images/%s".formatted(id), // key
                    file.getInputStream(), metadata);
            putReq = putReq.withCannedAcl(CannedAccessControlList.PublicRead);

            // Upload to S3 bucket
            PutObjectResult result = s3.putObject(putReq);
        } catch (IOException ex){
            ex.printStackTrace();
        }
        return id;
    }

}
