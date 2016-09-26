import React, {Component} from 'react'
import {AudioPlaylist} from '/imports/ui/audio'
import {Blog, News} from '/imports/ui/blog/article'
import {Edit, ChangePassword, ResetPassword} from '/imports/ui/blog/edit'
import {Chat} from '/imports/ui/chat'
import {FileRoute} from '/imports/ui/file'
import {Gallery, Visual} from '/imports/ui/visual'
import {InviteList, FriendList, GroupsList, SubscriberList, User, UserList} from '/imports/ui/list'
import {LoginPage} from '/imports/ui/auth/login'
import {Messenger} from '/imports/ui/message'
import {PhoneRoute} from '/imports/ui/phone'
import {Route, IndexRoute} from 'react-router'
import {Signup} from '/imports/ui/auth/signup'
import {VideoList} from '/imports/ui/video'
import {App, BrowserFeatures, NoIndex, Root, Unavailable, NotFound}
from '/imports/startup/client/base'

export const RootRoute = <Route path='/' component={Root}>
    <IndexRoute component={BrowserFeatures}/>
    <Route component={App}>
      <Route path="messenger" component={Messenger}/>
      <Route path="news" component={News}/>
      <Route path="dialog/:peer" component={Messenger}/>
      <Route path="profile" component={Blog}/>
      <Route path="blog/:id" component={Blog}/>
      <Route path="invites" component={InviteList}/>
      <Route path="gallery/:id" component={Gallery}/>
      <Route path="image/:id" component={Visual}/>
      <Route path="video/:id" component={Visual}/>
      <Route path="blog/:id/video" component={VideoList}/>
      <Route path="blog/:id/audio" component={AudioPlaylist}/>
      <Route path="settings" component={Edit}/>
      <Route path="edit/:id" component={Edit}/>
      <Route path="change-password" component={ChangePassword}/>
      <Route path="friends/:id" component={FriendList}/>
      <Route path="friends" component={FriendList}/>
      <Route path="important" component={FriendList}/>
      <Route path="groups" component={GroupsList}/>
      <Route path="subscribers" component={SubscriberList}/>
      <Route path="subscribers/:id" component={SubscriberList}/>
      <Route path="groups/:id" component={GroupsList}/>
      <Route path="unavailable" component={Unavailable}/>
      <Route path="chat/:id/edit" component={Chat}/>
      <Route path="users" component={UserList}/>
      {FileRoute}
    </Route>
    <Route component={NoIndex}>
      <Route path="login" component={LoginPage}/>
      <Route path="signup" component={Signup}/>
      <Route path="signup/verify" component={Signup}/>
      <Route path="signup/about" component={Signup}/>
      <Route path="reset-password" component={ResetPassword}/>
      <Route path="*" component={NotFound}/>
    </Route>
  </Route>
