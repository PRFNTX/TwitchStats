class Auth {
    static authenticateUser(token){
        localStorage.setItem('token',token);
    }

    static isUserAuthenticated(){
        return !(localStorage.getItem('token')===null);
    }

    static deauthenticateUser(){
        localStorage.removeItem('token');
    }

    static getToken(){
        return localStorage.getItem('token');
    }
    static failedAuth(code){
        if (code===411){
            Auth.deauthenticateUser();
            window.location.pathname="/login"
        }
    }
}

export default Auth