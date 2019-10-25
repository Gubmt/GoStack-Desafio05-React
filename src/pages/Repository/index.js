import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import { Loading, Owner, IssueList, Form, Pages } from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    issueState: 'all',
    checked: true,
    lastPage: false,
    page: 1,
  };

  async componentDidMount() {
    this.handleIssueState();
  }

  async componentDidUpdate(_, prevState) {
    const { issueState, page } = this.state;
    if (prevState.issueState !== issueState || prevState.page !== page) {
      this.handleIssueState();
    }
  }

  handleInputChange = async e => {
    this.setState({
      issueState: e.target.value,
      checked: e.target.value === 'all',
      page: 1,
    });
  };

  handleIssueState = async () => {
    const { match } = this.props;
    const { issueState, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issueState,
          page,
        },
      }),
    ]);

    this.setState({
      loading: false,
      repository: repository.data,
      issues: issues.data,
      lastPage: issues.data.length < 30,
    });
  };

  prevPage() {
    const { page } = this.state;
    if (page !== 1)
      this.setState({
        page: page - 1,
      });
  }

  nextPage() {
    const { page, lastPage } = this.state;
    if (!lastPage) {
      this.setState({
        page: page + 1,
      });
    }
  }

  render() {
    const { repository, issues, loading, checked, page, lastPage } = this.state;
    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <Form>
          <input
            type="radio"
            name="issueState"
            value="open"
            onChange={this.handleInputChange}
          />{' '}
          <span>Aberto</span> <br />
          <input
            type="radio"
            name="issueState"
            value="closed"
            onChange={this.handleInputChange}
          />{' '}
          <span>Fechado</span> <br />
          <input
            type="radio"
            name="issueState"
            value="all"
            onChange={this.handleInputChange}
            checked={checked}
          />{' '}
          <span>Todos</span>
        </Form>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pages>
          <button
            className="prev"
            disabled={page === 1}
            type="submit"
            onClick={() => this.prevPage()}
          >
            <span>Anterior</span>
          </button>
          <span className="pageNumber">Página {page}</span>
          <button
            className="next"
            disabled={lastPage}
            type="submit"
            onClick={() => this.nextPage()}
          >
            <span>Seguinte</span>
          </button>
        </Pages>
      </Container>
    );
  }
}
