import React, {Component} from 'react'

export class Alert extends Component {
  render() {
    return <div id={'modal-notify-' + this.props.type} className="modal fade modal-notify" tabindex="-1" role="dialog">
      <div className="modal-dialog modal-md" role="document">
        <div className="modal-content">
          <span className="icon icon-accept-big"/>
          <h1>{this.props.text}</h1>
          <button type="button" className="close" data-dismiss="modal" aria-label="Close">
            <span className="icon icon-close-green" aria-hidden="true"/></button>
        </div>
      </div>
    </div>
  }
}
