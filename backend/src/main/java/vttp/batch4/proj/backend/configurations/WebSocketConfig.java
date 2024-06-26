package vttp.batch4.proj.backend.configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@CrossOrigin
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Specify allowed origins explicitly
        registry.addEndpoint("/chat")
                .setAllowedOrigins("http://localhost:4200")
                .setAllowedOrigins("https://graceful-coil-production.up.railway.app")
                .setAllowedOrigins("https://tixbuds.vercel.app")
                .withSockJS();

        // Register the endpoint for single user WebSocket
        registry.addEndpoint("/single-chat")
                .setAllowedOrigins("http://localhost:4200")
                .setAllowedOrigins("https://graceful-coil-production.up.railway.app")
                .setAllowedOrigins("https://tixbuds.vercel.app")
                .withSockJS();
    }

}
