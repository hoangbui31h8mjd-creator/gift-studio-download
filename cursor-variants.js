/* Fixed decorative templates. Pointer tracking and preview controls live elsewhere. */
(function (root) {
  'use strict';

  const variants = {
    star: `
      <span class="cursor-toy-motion" aria-hidden="true">
        <span class="cursor-toy cursor-toy-star">
          <span class="toy-glass-backdrop"></span>
          <svg viewBox="0 0 36 36" width="36" height="36" focusable="false" aria-hidden="true">
            <defs>
              <linearGradient id="variant-star-glass" x1="0" y1="0" x2=".9" y2="1">
                <stop stop-color="#fff" stop-opacity=".29"/>
                <stop offset=".38" stop-color="#fff" stop-opacity=".06"/>
                <stop offset=".72" stop-color="#edf2ff" stop-opacity=".12"/>
                <stop offset="1" stop-color="#fff" stop-opacity=".29"/>
              </linearGradient>
              <linearGradient id="variant-star-edge" x1=".1" y1="0" x2=".85" y2="1">
                <stop stop-color="#fff" stop-opacity=".96"/>
                <stop offset=".38" stop-color="#fff" stop-opacity=".62"/>
                <stop offset=".64" stop-color="#fff" stop-opacity=".25"/>
                <stop offset="1" stop-color="#fff" stop-opacity=".82"/>
              </linearGradient>
              <radialGradient id="variant-star-light" cx=".22" cy=".16" r=".83">
                <stop stop-color="#fff" stop-opacity=".55"/>
                <stop offset=".5" stop-color="#fff" stop-opacity=".08"/>
                <stop offset="1" stop-color="#fff" stop-opacity="0"/>
              </radialGradient>
              <clipPath id="variant-star-clip">
                <path d="M18 1.7C19.9 1.7 20.1 8.1 23.1 11.1C26.1 14.1 34.3 15.8 34.3 18C34.3 20.2 26.1 21.9 23.1 24.9C20.1 27.9 19.9 34.3 18 34.3C16.1 34.3 15.9 27.9 12.9 24.9C9.9 21.9 1.7 20.2 1.7 18C1.7 15.8 9.9 14.1 12.9 11.1C15.9 8.1 16.1 1.7 18 1.7Z"/>
              </clipPath>
            </defs>
            <path d="M18 1.7C19.9 1.7 20.1 8.1 23.1 11.1C26.1 14.1 34.3 15.8 34.3 18C34.3 20.2 26.1 21.9 23.1 24.9C20.1 27.9 19.9 34.3 18 34.3C16.1 34.3 15.9 27.9 12.9 24.9C9.9 21.9 1.7 20.2 1.7 18C1.7 15.8 9.9 14.1 12.9 11.1C15.9 8.1 16.1 1.7 18 1.7Z"
              fill="url(#variant-star-glass)" stroke="url(#variant-star-edge)" stroke-width=".85"/>
            <g clip-path="url(#variant-star-clip)">
              <ellipse cx="14" cy="10" rx="15" ry="18" fill="url(#variant-star-light)"/>
              <path d="M17.9 5.1C17 9.1 16.3 11.1 13.9 13.5C11.7 15.6 8.8 16.2 5.5 17.4"
                fill="none" stroke="#fff" stroke-opacity=".67" stroke-width=".9" stroke-linecap="round"/>
              <path d="M21.8 25.6C20.2 27.8 19.8 30 19 32" fill="none"
                stroke="#fff" stroke-opacity=".55" stroke-width=".7" stroke-linecap="round"/>
            </g>
          </svg>
        </span>
      </span>`,

    droplet: `
      <span class="cursor-toy-motion" aria-hidden="true">
        <span class="cursor-toy cursor-toy-droplet">
          <span class="toy-glass-backdrop"></span>
          <svg viewBox="0 0 36 36" width="36" height="36" focusable="false" aria-hidden="true">
            <defs>
              <linearGradient id="variant-droplet-glass" x1=".1" y1="0" x2=".8" y2="1">
                <stop stop-color="#fff" stop-opacity=".32"/>
                <stop offset=".35" stop-color="#fff" stop-opacity=".11"/>
                <stop offset=".66" stop-color="#e6edff" stop-opacity=".07"/>
                <stop offset="1" stop-color="#fff" stop-opacity=".3"/>
              </linearGradient>
              <linearGradient id="variant-droplet-edge" x1=".1" y1=".05" x2=".82" y2="1">
                <stop stop-color="#fff" stop-opacity=".9"/>
                <stop offset=".4" stop-color="#fff" stop-opacity=".59"/>
                <stop offset=".69" stop-color="#fff" stop-opacity=".25"/>
                <stop offset="1" stop-color="#fff" stop-opacity=".72"/>
              </linearGradient>
              <radialGradient id="variant-droplet-light" cx=".21" cy=".17" r=".85">
                <stop stop-color="#fff" stop-opacity=".65"/>
                <stop offset=".36" stop-color="#fff" stop-opacity=".16"/>
                <stop offset="1" stop-color="#fff" stop-opacity="0"/>
              </radialGradient>
              <clipPath id="variant-droplet-clip">
                <path d="M23.9 2.8C27.6 2 28.6 7.5 30.5 12.4C32.6 17.8 33.8 22.5 30.8 27.4C27.7 32.5 21.4 34.4 15.3 33.1C8.8 31.7 4.3 27.1 4.1 21.3C3.9 15.2 8.3 11.7 13.3 9.2C17.3 7.2 20.2 3.6 23.9 2.8Z"/>
              </clipPath>
            </defs>
            <path d="M23.9 2.8C27.6 2 28.6 7.5 30.5 12.4C32.6 17.8 33.8 22.5 30.8 27.4C27.7 32.5 21.4 34.4 15.3 33.1C8.8 31.7 4.3 27.1 4.1 21.3C3.9 15.2 8.3 11.7 13.3 9.2C17.3 7.2 20.2 3.6 23.9 2.8Z"
              fill="url(#variant-droplet-glass)" stroke="url(#variant-droplet-edge)" stroke-width=".85"/>
            <g clip-path="url(#variant-droplet-clip)">
              <ellipse cx="16" cy="13" rx="17" ry="21" fill="url(#variant-droplet-light)"/>
              <path d="M23.6 5.7C20.6 6.7 18 9.5 14.6 11.3C10.4 13.4 7.6 15.9 7.2 19.6"
                fill="none" stroke="#fff" stroke-opacity=".77" stroke-width="1.1" stroke-linecap="round"/>
              <path d="M29.6 24.5C27.5 29.4 22.6 31.5 17 30.4" fill="none"
                stroke="#fff" stroke-opacity=".49" stroke-width=".8" stroke-linecap="round"/>
              <ellipse cx="11.5" cy="15.4" rx="1.45" ry="2.3" transform="rotate(38 11.5 15.4)"
                fill="#fff" fill-opacity=".39"/>
            </g>
          </svg>
        </span>
      </span>`,

    gift: `
      <span class="cursor-toy-motion" aria-hidden="true">
        <span class="cursor-toy cursor-toy-gift">
          <span class="gift-toy-glow"></span>
          <span class="gift-toy-body">
            <span class="toy-glass-backdrop"></span>
            <span class="gift-toy-flow"><span class="gift-toy-flow-light"></span></span>
            <svg viewBox="0 0 36 36" width="36" height="36" focusable="false" aria-hidden="true">
              <defs>
                <linearGradient id="variant-gift-body" x1="0" y1="0" x2="1" y2="1">
                  <stop stop-color="#f1f4ff" stop-opacity=".32"/>
                  <stop offset=".43" stop-color="#e5ecf8" stop-opacity=".12"/>
                  <stop offset="1" stop-color="#dfe4f3" stop-opacity=".25"/>
                </linearGradient>
                <linearGradient id="variant-gift-body-edge" x1="0" y1="0" x2=".85" y2="1">
                  <stop stop-color="#fff" stop-opacity=".91"/>
                  <stop offset=".5" stop-color="#f0f5ff" stop-opacity=".36"/>
                  <stop offset="1" stop-color="#f6f8ff" stop-opacity=".74"/>
                </linearGradient>
                <linearGradient id="variant-gift-body-ribbon" x1="0" y1="0" x2="1" y2="0">
                  <stop stop-color="#fff" stop-opacity=".28"/>
                  <stop offset=".5" stop-color="#fff" stop-opacity=".61"/>
                  <stop offset="1" stop-color="#fff" stop-opacity=".3"/>
                </linearGradient>
              </defs>
              <path d="M6.3 15.7H29.7V28.6C29.7 31.7 28.1 33.1 25.1 33.1H10.9C7.9 33.1 6.3 31.7 6.3 28.6Z"
                fill="url(#variant-gift-body)" stroke="url(#variant-gift-body-edge)" stroke-width=".85"/>
              <path d="M16.1 16.2H19.9V32.8H16.1Z" fill="url(#variant-gift-body-ribbon)"/>
              <path d="M8.5 20.2V27.7C8.5 29.6 9.2 30.7 11.3 30.7" fill="none"
                stroke="#fff" stroke-opacity=".65" stroke-width=".8" stroke-linecap="round"/>
              <path d="M22 31H25.1C26.7 31 27.6 30.3 27.6 28.9" fill="none"
                stroke="#fff" stroke-opacity=".31" stroke-width=".7" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="gift-toy-lid">
            <span class="toy-glass-backdrop"></span>
            <svg viewBox="0 0 36 36" width="36" height="36" focusable="false" aria-hidden="true">
              <defs>
                <linearGradient id="variant-gift-lid" x1=".2" y1="0" x2=".8" y2="1">
                  <stop stop-color="#fff" stop-opacity=".47"/>
                  <stop offset=".5" stop-color="#edf2ff" stop-opacity=".18"/>
                  <stop offset="1" stop-color="#dce4f5" stop-opacity=".28"/>
                </linearGradient>
                <linearGradient id="variant-gift-lid-edge" x1="0" y1="0" x2=".8" y2="1">
                  <stop stop-color="#fff" stop-opacity=".98"/>
                  <stop offset="1" stop-color="#f0f5ff" stop-opacity=".64"/>
                </linearGradient>
                <linearGradient id="variant-gift-bow" x1="0" y1="0" x2=".9" y2="1">
                  <stop stop-color="#fff" stop-opacity=".91"/>
                  <stop offset="1" stop-color="#edf2ff" stop-opacity=".43"/>
                </linearGradient>
              </defs>
              <path d="M17.8 10.9C15.8 5 12.1 2.6 10.2 5C7.9 7.9 12.6 11.2 17.8 10.9Z"
                fill="#fff" fill-opacity=".13" stroke="url(#variant-gift-bow)" stroke-width="1.45" stroke-linejoin="round"/>
              <path d="M18.2 10.9C20.2 5 23.9 2.6 25.8 5C28.1 7.9 23.4 11.2 18.2 10.9Z"
                fill="#eff4ff" fill-opacity=".13" stroke="url(#variant-gift-bow)" stroke-width="1.45" stroke-linejoin="round"/>
              <rect x="4.3" y="11.1" width="27.4" height="7.2" rx="2.7"
                fill="url(#variant-gift-lid)" stroke="url(#variant-gift-lid-edge)" stroke-width=".85"/>
              <path d="M16.1 11.2H19.9V18.1H16.1Z" fill="#fff" fill-opacity=".44"/>
              <path d="M7.1 12.7H14.2" fill="none" stroke="#fff" stroke-opacity=".75"
                stroke-width=".8" stroke-linecap="round"/>
              <path d="M21.8 16.9H28.5" fill="none" stroke="#fff" stroke-opacity=".38"
                stroke-width=".65" stroke-linecap="round"/>
            </svg>
          </span>
        </span>
      </span>`,
  };

  root.GiftCursorVariants = variants;
  if (typeof module === 'object' && module.exports) module.exports = variants;
})(globalThis);
