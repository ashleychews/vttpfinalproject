package vttp.batch4.proj.backend.repositories;

import java.sql.ResultSet;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import vttp.batch4.proj.backend.exceptions.UserException;
import vttp.batch4.proj.backend.models.User;
import vttp.batch4.proj.backend.models.UserProfile;

@Repository
public class UserRepository {

    @Autowired
    private JdbcTemplate template;

    @Autowired
    private SqlQueries queries;

    public Optional<User> userExists(String email) {

        SqlRowSet rs = template.queryForRowSet(queries.SQL_SELECT_USER_BY_EMAIL, email);
        if (!rs.next())
            return Optional.empty();
        return Optional.of(new User(rs.getString("id"), rs.getString("email"), rs.getString("password")));
        
    }

    //save user
    public void saveUser(User user) throws UserException{
        String id = UUID.randomUUID().toString().substring(0,8);

        try {
            if (template.update(queries.SQL_INSERT_NEW_USER,
            id, user.getEmail(), user.getPassword()) !=1)
                throw new UserException("Cannot create new user");

        } catch (DataAccessException ex) {
            throw new UserException(ex.getMessage());
        }
    }

    //save user profile
    public void saveUserProfile(UserProfile userProfile) throws UserException {
        try {
            template.update(queries.SQL_INSERT_USER_PROFILE,
                userProfile.getEmail(),
                userProfile.getUserName(),
                userProfile.getFirstName(),
                userProfile.getLastName(),
                userProfile.getBirthDate(),
                userProfile.getPhoneNo(),
                userProfile.getPictureId(),
                userProfile.getMediaType()
            );
        } catch (DataAccessException ex) {
            throw new UserException(ex.getMessage());
        }
    }

    //getting user profile
    public UserProfile getUserProfile(String email) throws UserException {
        try {
            return template.query(queries.SQL_SELECT_PROFILE_BY_EMAIL,

            (ResultSet rs) -> {

                if (rs.next()) {
                    UserProfile profile = new UserProfile();
                    profile.setEmail(email);
                    profile.setUserName(rs.getString("username"));
                    profile.setFirstName(rs.getString("firstname"));
                    profile.setLastName(rs.getString("lastname"));
                    profile.setBirthDate(rs.getString("birthdate"));
                    profile.setPhoneNo(rs.getString("phonenumber"));
                    profile.setPictureId(rs.getString("pic_id"));
                    profile.setMediaType(rs.getString("mime"));
                    return profile;
            }
            return new UserProfile(); 
        }, email);
        
        } catch (DataAccessException ex){
            throw new UserException(ex.getMessage());
        }
    }

    //updating user profile
    public void updateUserProfile(UserProfile userProfile) throws UserException {
        try {
            template.update(queries.SQL_UPDATE_PROFILE_BY_EMAIL,
            userProfile.getUserName(),
            userProfile.getFirstName(),
            userProfile.getLastName(),
            userProfile.getBirthDate(),
            userProfile.getPhoneNo(),
            userProfile.getPictureId(),
            userProfile.getMediaType(),
            userProfile.getEmail()
        );
        } catch (DataAccessException ex) {
            throw new UserException(ex.getMessage());
        }
    }

}