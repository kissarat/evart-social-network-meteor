import React, {Component} from 'react'
import {Login, Footer} from './login'
import '/imports/stylesheets/registration.scss'

export const Signup = () => <div id="signup-page">
  <main>
    <div className="container">
      <div className="row">
        <div className="col-md-offset-3 col-md-6">
          <Login/>
        </div>
      </div>
      <div className="row reg">
        <div className="col-md-offset-2 col-md-8 col-lg-offset-3 col-lg-6">
          <h1 className="text-center">Простая регистрация в 3 шага</h1>
          <p className="text-center">Заполните все поля для успешной регистрации</p>
        </div>
        <div className="col-md-offset-2 col-md-8">
          <div className="reg-progress">
            <div className="step-1 active">
              <div className="round">1</div>
              <div className="step-desc">STEP</div>
              <div className="action active">
                <form className="form-inline">
                  <div className="group">
                    <div className="form-group input-group-lg">
                      <label className="sr-only" htmlFor="phone">Email address</label>
                      <input type="text" className="form-control" id="phone" placeholder="Phone number"/>
                    </div>
                    <div className="form-group input-group-lg">
                      <button type="submit" className="btn">Register</button>
                    </div>
                  </div>
                  <div className="mt">
                    <div className="form-group">
                      <div className="chbox">
                        <input type="checkbox" id="checkbox-reg"/>
                        <label htmlFor="checkbox-reg">
                          I am accepting <a href="#" target="_blank">license agreement</a>
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="step-line hidden-xs"></div>
            <div className="step-2">
              <div className="round">2</div>
              <div className="step-desc">STEP</div>
              <div className="action">
                <h1>STEP 2</h1>
              </div>
            </div>
            <div className="step-line hidden-xs"></div>
            <div className="step-3">
              <div className="round">3</div>
              <div className="step-desc">STEP</div>
              <div className="action">
                <h1>STEP 3</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <Footer/>
</div>
