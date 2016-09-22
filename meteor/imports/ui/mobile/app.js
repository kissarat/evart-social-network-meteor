import React, {Component} from 'react'
import {Busy, Avatar} from '/imports/ui/common/widget'
import {Title, Track, Informer} from '/imports/ui/blog/layout'

export class App extends Component {
  componentWillMount() {
    Meteor.call('blog.get', {id: Meteor.userId()}, (err, state) => {
      if (!err) {
        this.setState(state)
        setTimeout(() => this.setState({collapsed: true}), 2000)
      }
    })
  }

  onClickNav = (e) => {
    this.setState({collapsed: !this.state.collapsed})
  }

  onClickScrollTop = () => {
    if (this.state.collapsed) {
      window.scrollTo(0, 0)
    }
  }

  render() {
    if (this.state) {
      const informers = Informer.all(this.props)
      return <div className="mobile-container">
        <header>
          <Avatar {...this.state} className="back avatar tile"/>
          <Title {...this.state} />
        </header>
        <div id="main">
          <nav className={this.state.collapsed ? 'collapsed' : ''} onClick={this.onClickNav}>
            <Track {...this.state}/>
            {informers.friends}
            {informers.video}
            {informers.subscribers}
            {informers.groups}
            <div id="scroll-top" onClick={this.onClickScrollTop}></div>
          </nav>
          <div>{this.props.children}</div>
        </div>
      </div>
    }
    else {
      return <Busy/>
    }
  }
}
