import React, {Component} from 'react'
// import {Subscriber} from './widget'

export class Editor extends Component {
  render() {
    return <form id="@@id" className="message-block">
      <label htmlFor="file">
        <span className="icon icon-attach"/>
        <input type="file" name="file" id="file" className="hidden"/>
      </label>
      <textarea name="messsage" placeholder="Type your message..."/>
      <div className="controls">
        <div className="add">
          <span className="icon icon-add"/>
        </div>
        <div className="emoji">
          <span className="icon icon-smile"/>
        </div>
        <button className="send" type="submit">
          <span className="icon icon-send"/>
        </button>
      </div>
    </form>
  }
}

export class Messenger extends Component {
  render() {
    return <div className="container">
      <div className="row wrap">
        <div id="messenger">
          <div className="messenger-container">
            <div className="dialogs">
              <ul>
              </ul>
              <div className="find">
                <div className="input-group">
                  <input type="text" className="form-control" placeholder="Search dialog"/>
                  <span className="input-group-addon">
                    <i className="icon icon-search"/>
                  </span>
                </div>
              </div>
            </div>
            <div className="messages">
              <ul>
              </ul>
              <Editor/>
              <div className="addblock hidden">
                <div className="head">
                  <span>Public chat</span>
                  <span className="icon icon-dialog-menu"/>
                </div>
                <div className="content">
                </div>
                <div className="footer find">
                  <div className="input-group">
                    <input type="text" className="form-control" placeholder="Search"/>
                    <span className="input-group-addon">
                      <i className="icon icon-dialog-search"/>
                    </span>
                  </div>
                </div>
              </div>
              <div className="addmenu hidden">
                <ul>
                  <li><a href="#">Change chat name</a></li>
                  <li><a href="#">Add chat icon</a></li>
                  <li><a href="#">Show members</a></li>
                  <li><a href="#">Leave conversation</a></li>
                  <li><a href="#">Delete conversation</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  }
}
