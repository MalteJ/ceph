declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      login(username?: string, password?: string): void;
      logToConsole(message: string, optional?: any): void;
      text(): Chainable<string>;
      ceph2Login(username?: string, password?: string): Chainable<any>;
    }
  }
}
// Disabling tslint rule since cypress-cucumber has
// issues with absolute import paths.
// This can be removed when
// https://github.com/cypress-io/cypress-browserify-preprocessor/issues/53
// is fixed.
/* tslint:disable*/
import { CdHelperClass } from '../../src/app/shared/classes/cd-helper.class';
import { Permissions } from '../../src/app/shared/models/permissions';
/* tslint:enable*/
let auth: any;

const fillAuth = () => {
  window.localStorage.setItem('dashboard_username', auth.username);
  window.localStorage.setItem('dashboard_permissions', auth.permissions);
  window.localStorage.setItem('user_pwd_expiration_date', auth.pwdExpirationDate);
  window.localStorage.setItem('user_pwd_update_required', auth.pwdUpdateRequired);
  window.localStorage.setItem('sso', auth.sso);
};

Cypress.Commands.add('login', (username, password) => {
  requestAuth(username, password).then((resp) => {
    auth = resp.body;
    auth.permissions = JSON.stringify(new Permissions(auth.permissions));
    auth.pwdExpirationDate = String(auth.pwdExpirationDate);
    auth.pwdUpdateRequired = String(auth.pwdUpdateRequired);
    auth.sso = String(auth.sso);
    fillAuth();
  });
});

Cypress.Commands.add('ceph2Login', (username, password) => {
  const url: string = Cypress.env('CEPH2_URL');
  requestAuth(username, password, url).then((resp) => {
    auth = resp.body;
    auth.permissions = JSON.stringify(new Permissions(auth.permissions));
    auth.pwdExpirationDate = String(auth.pwdExpirationDate);
    auth.pwdUpdateRequired = String(auth.pwdUpdateRequired);
    auth.sso = String(auth.sso);
    const args = {
      username: auth.username,
      permissions: auth.permissions,
      pwdExpirationDate: auth.pwdExpirationDate,
      pwdUpdateRequired: auth.pwdUpdateRequired,
      sso: auth.sso
    };
    // @ts-ignore
    cy.origin(
      url,
      { args },
      ({ uname, permissions, pwdExpirationDate, pwdUpdateRequired, sso }: any) => {
        window.localStorage.setItem('dashboard_username', uname);
        window.localStorage.setItem('dashboard_permissions', permissions);
        window.localStorage.setItem('user_pwd_expiration_date', pwdExpirationDate);
        window.localStorage.setItem('user_pwd_update_required', pwdUpdateRequired);
        window.localStorage.setItem('sso', sso);
      }
    );
  });
});

function requestAuth(username: string, password: string, url = '') {
  username = username ? username : Cypress.env('LOGIN_USER');
  password = password ? password : Cypress.env('LOGIN_PWD');
  return cy.request({
    method: 'POST',
    url: !url ? 'api/auth' : `${url}api/auth`,
    headers: { Accept: CdHelperClass.cdVersionHeader('1', '0') },
    body: { username: username, password: password }
  });
}

// @ts-ignore
Cypress.Commands.add('text', { prevSubject: true }, (subject: any) => {
  return subject.text();
});

Cypress.Commands.add('logToConsole', (message: string, optional?: any) => {
  cy.task('log', { message: `(${new Date().toISOString()}) ${message}`, optional });
});
