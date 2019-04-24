import React, { Component } from "react";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";

import AuthPage from "./pages/auth";
import Events from "./pages/Events";
import Booking from "./pages/Booking";
import MainNavigation from "./components/navigation/mainNavigation";
import AuthContext from "./context/auth-context";

import "./App.css";

class App extends Component {

  state = {
    userId: null,
    token: null,
  }

  login = (userId, token, tokenExpiration) => {
    this.setState({userId, token})
  }

  logout = () => {
    this.setState({
      userId: null,
      token: null,
    })
  }



  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <AuthContext.Provider value={{userId: this.state.userId, token: this.state.token, login: this.login, logout: this.logout }}>
            <MainNavigation />
            <main className="main-content">
              <Switch>
                {!this.state.token && <Redirect from="/" to="/auth" exact />}
                {this.state.token && <Redirect from="/auth" to="/events" exact />}
                {this.state.token && <Redirect from="/" to="/events" exact />}
                {!this.state.token && <Redirect from="/bookings" to="/auth" exact />}
                <Route path="/auth" component={AuthPage} />
                <Route path="/events" component={Events} />
                <Route path="/bookings" component={Booking} />
              </Switch>
            </main>
          </AuthContext.Provider>
        </React.Fragment>
      </BrowserRouter>
    );
  }
}

export default App;
