import { RedirectRequest } from '@azure/msal-browser';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sign-up-invitation',
  templateUrl: './sign-up-invitation.component.html',
  styleUrls: ['./sign-up-invitation.component.css']
})
export class SignUpInvitationComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {

    const id_token_hint: string = this.route.snapshot.queryParamMap.get('id_token_hint') + "";
    if (id_token_hint != "" && id_token_hint != null && id_token_hint != "null") {
      let redirectRequest: RedirectRequest = {
        scopes: ["openid"],
        extraQueryParameters: { id_token_hint: id_token_hint }
      };

      let tryCount: any = 0;
      if (localStorage.getItem("suiTry") != null) {
        tryCount = localStorage.getItem("suiTry")
      }
      localStorage.setItem("suiTry", (tryCount + 1) + "");
    }

  }

}
