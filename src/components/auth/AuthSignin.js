import React, {Component} from 'react';
import AuthService from "../../services/AuthService";
import ValidationService from "../../services/ValidationService";
import {INTERNAL_SERVER_ERROR, AUTH_SERVER_ERR_MESSAGES} from "../../constants/apiErrMessages";
import ServerErrMessage from "../common/server-err-message/ServerErrMessage";
import Input from "../common/input/Input";
import Button from "../common/button/Button";
import Loader from "../common/loader/Loader";
import {Link, Redirect} from "react-router-dom";

export default class AuthSignin extends Component {
  constructor() {
    super();
    this.authService = new AuthService();
    this.validationService = new ValidationService();
  }

  state = {
    user: {
      email: "",
      password: ""
    },
    emailErrMessage: "",
    passErrMessage: "",
    serverErrMessage: "",
    showLoader: false,
    isRedirect: false
  }

  handleInputChange = ({target: {name, value}}) => {
    this.setState({
      ...this.state,
      user: {
        ...this.state.user,
        [name]: value
      }
    });
  }

  handleSubmit = e => {
    e.preventDefault();

    this.clearErrMessages();

    const {email, password} = this.state.user;
    const emailValidData = this.validationService.validateEmail(email);
    const passwordValidData = this.validationService.validatePassword(password);

    if (emailValidData.isValid && passwordValidData.isValid) {
      this.signin({email, password});
    } else {
      this.setState({
        ...this.state,
        emailErrMessage: emailValidData.errMessage,
        passErrMessage: passwordValidData.errMessage
      });
    }
  }

  clearErrMessages = () => {
    this.setState({
      ...this.state,
      emailErrMessage: "",
      passErrMessage: "",
      serverErrMessage: "",
      showLoader: true
    });
  }

  signin = user => {
    this.authService.signin(user)
      .then(() => {
        this.setLoaderState(false);
        this.setRedirectState(true);
      })
      .catch(err => {
        this.setLoaderState(false);
        this.showServerErrMessage(err);
      });
  }

  setLoaderState = (state) => {
    this.setState({
      ...this.state,
      showLoader: state
    });
  }

  setRedirectState = state => {
    this.setState({
      ...this.state,
      isRedirect: state
    });
  }

  showServerErrMessage = err => {
    switch (err) {
      case 500:
        this.setServerErrMessage(INTERNAL_SERVER_ERROR);
        break;
      case 602:
        this.setServerErrMessage(AUTH_SERVER_ERR_MESSAGES.WRONG_EMAIL_OR_PASSWORD);
        break;
      default:
    }
  }

  setServerErrMessage = errMessage => {
    this.setState({
      ...this.state,
      serverErrMessage: errMessage
    });
  }

  render() {
    const {email, password} = this.state.user;
    const {emailErrMessage, passErrMessage, serverErrMessage, showLoader, isRedirect} = this.state;

    return (
      <section className="auth">
        <form action="#" className="auth__form">
          <h2 className="title title_item">Sign <span>In</span></h2>
          <ServerErrMessage>{serverErrMessage}</ServerErrMessage>
          <Input type={"email"} name={"email"} value={email} onChange={this.handleInputChange} labelText={"Email"} errorMessage={emailErrMessage}/>
          <Input type={"password"} name={"password"} value={password} onChange={this.handleInputChange} labelText={"Password"} errorMessage={passErrMessage}/>
          <Button type={"submit"} onClick={this.handleSubmit}>Sign in</Button>
        </form>

        <div className="auth__link">
          <Link to="/signup">No account? Create one here.</Link>
        </div>

        {showLoader && <Loader/>}
        {isRedirect && <Redirect to={{pathname: '/news'}}/>}
      </section>
    )
  }
}