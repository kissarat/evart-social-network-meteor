import React, {Component} from 'react'
import {Link} from 'react-router'
import '/imports/stylesheets/main.scss'

export const App = ({children}) => <section role="main">
  <div id="container-add-left">
    <div className="addon-container addon-container-left fade">
      <div className="statusbar">
        <span className="icon icon-statusbar-prev"/>
        <span className="icon icon-statusbar-close"/>
      </div>
      <div className="addon-content-media"></div>
    </div>
  </div>
  <div id="container-add-right">
    <div className="addon-container addon-container-right fade">
      <div className="statusbar">
        <span className="icon icon-statusbar-prev"/>
        <span className="icon icon-statusbar-close"/>
      </div>
      <div className="addon-content-media"></div>
    </div>
  </div>
  {children}
  <nav id="menu" role="navigation">
    <div className="bar center-block">
      <Link to="/news" className="menu menu-news" title="News"/>
      <Link to="/profile" className="menu menu-profile" title="Profile"/>
      <Link to="/notifications" className="menu menu-feedback" title="Feedback" data-content="3"/>
      <Link to="/messenger" className="menu menu-message" title="Messenger" data-content="123"/>
      <Link to="/call" className="menu menu-phone" title="Call"/>
      <Link to="/friends" className="menu menu-friends" title="Friends"/>
      <Link to="/groups" className="menu menu-group" title="Groups"/>
      <Link to={'/gallery/' + Meteor.userIdInt()} className="menu menu-photo" title="Photos"/>
      <Link to="/video-search" className="menu menu-video" title="Videos"/>
      <Link to="/video" className="menu menu-movie" title="Movies"/>
      <Link to="/player" className="menu menu-music" title="Music"/>
      <Link to="/settings" className="menu menu-settings" title="Settings"/>
    </div>
  </nav>
</section>
