import React, {Component} from 'react'

class Message extends Component {
  render() {
    return (
      <div key={this.params.id}>
        <div>
          <img src={this.params.avatar}/>
          <div className="name">{this.params.name}</div>
        </div>
        <div className="text">{this.params.text}</div>
      </div>
    )
  }
}

class Dialog extends Component {
  subscribtionName = 'message'

  constructor() {
    this.setState({
      recipient: +localstorage.recipient,
      peer: this.props.params.peer
    })
  }

  render() {
    const messages = (this.subscription || []).map(m =>
      <Message key={m.id}
               id={m.id}
               name={m.name}
               name={m.text}
      />
    )
    return (
      <div key={this.props.params.peer}>
        <div>
          <input value={this.props.params.peer}/>
        </div>
        <div>{messages}</div>
        <div>
        </div>
      </div>
    )
  }
}
