package vttp.batch4.proj.backend.repositories;

import org.springframework.stereotype.Repository;

@Repository
public class SqlQueries {

    public final String SQL_SELECT_USER_BY_EMAIL = """
        select * from users where email = ?        
    """;

    public final String SQL_INSERT_NEW_USER = """
        insert into users (id, username, email, password) 
        values (?,?,?,?)
    """;

    public final String SQL_INSERT_USER_PROFILE = """
        insert into user_profile (email, firstname, lastname, birthdate, phonenumber)
        values (?, ?, ?, ?, ?)
    """;

    public final String SQL_SELECT_PROFILE_BY_EMAIL = """
        select * from user_profile where email = ?        
    """;

    public final String SQL_UPDATE_PROFILE_BY_EMAIL = """
        update user_profile 
        set firstname = ?
        lastname = ?
        birthdate = ?
        phonenumber = ?
        where email = ?
    """;
    
}
