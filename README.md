         <div class="text">

            <ng-container *ngFor="let part of message.text | messageFormat">
          
              <!-- Bold -->
              <strong *ngIf="part.type === 'bold'">
                {{ part.text }}
              </strong>
          
              <!-- Normal link -->
              <a
                *ngIf="part.type === 'link'"
                [href]="part.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ part.text }}
              </a>
          
              <!-- Normal text -->
              <span *ngIf="part.type === 'text'">
                {{ part.text }}
              </span>
          
              <!-- prodUrl iframe -->
              <div
                *ngIf="part.type === 'iframe'"
                class="iframe-container"
              >
                <iframe
                *ngIf="part.type === 'iframe'"
                [src]="safeUrl(part.url)"
                class="stock-iframe"
                ></iframe>
              </div>
          
            </ng-container>
          
          </div>