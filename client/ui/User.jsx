import React, {Component} from 'react'
import ListView from './widget'

export class UserRow extends Component {
  render() {
    return (
      <tr>
        <td>{this.props.id}</td>
        <td>{this.props.domain}</td>
        <td>{this.props.name}</td>
      </tr>
    )
  }
}

export class UserList extends ListView {
  subscribtionName = 'user'
  
  sort = (e) => {
    const th = e.target
    const c = th.innerHTML
    this.state.order = {}
    if (th.classList.contains('fa-sort-asc')) {
      this.state.order[c] = -1
    }
    else if (th.classList.contains('fa')) {
      delete this.state.order[c]
    }
    else {
      this.state.order[c] = 1
    }
    this.subscibe(this.state)
  }

  render() {
    const columns = ['id', 'domain', 'name'].map((c) => {
      let order = ''
      if (this.state.order[c] > 0) {
        order = 'fa fa-sort-asc'
      }
      else if (this.state.order[c] < 0) {
        order = 'fa fa-sort-desc'
      }
      return <th onClick={this.sort} key={c} className={order}>{c}</th>
    })
    const rows = (this.subscription || []).map(u =>
      <UserRow key={u.id}
               id={u.id}
               domain={u.domain}
               name={u.name}
      />
    )
    return (
      <table className='table table-striped table-hover'>
        <thead>
        <tr>{columns}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    )
  }
}
