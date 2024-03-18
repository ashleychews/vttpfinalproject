export interface Events {
    name: string,
    type: string,
    id: string,
    imageUrl: string,
    localDate: string,
    localTime: string
}

export interface User {
    username: string,
    email: string,
    password: string
}

export interface Profile {
    firstname: string,
    lastname: string,
    birthdate: string
    phoneNo: number
}

export interface UserSlice {
    email: string;
}
  