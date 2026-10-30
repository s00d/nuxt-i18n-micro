- vue closed → <div class="i18n-switcher-wrapper" style="position: relative; display: inline-block; vertical-align: middle;"><button class="i18n-switcher-button" style="padding: 4px 12px; font-size: 16px; cursor: pointer; background-color: rgb(255, 255, 255); border: 1px solid rgb(51, 51, 51); transition: background-color 0.3s ease; display: flex; align-items: center; justify-content: space-between;" type="button" aria-haspopup="true" aria-expanded="false"><span>English</span><span style="margin-left: 8px; display: inline-block; transition: transform 0.3s ease;">▼</span></button></div>
- vue open → <div class="i18n-switcher-wrapper" style="position: relative; display: inline-block; vertical-align: middle;"><button class="i18n-switcher-button" style="padding: 4px 12px; font-size: 16px; cursor: pointer; background-color: rgb(255, 255, 255); border: 1px solid rgb(51, 51, 51); transition: background-color 0.3s ease; display: flex; align-items: center; justify-content: space-between;" type="button" aria-haspopup="true" aria-expanded="true"><span>English</span><span style="display: inline-block; transition: transform 0.3s ease; margin-left: 8px; transform: rotate(180deg);">▼</span></button>
  <ul class="i18n-switcher-dropdown" style="position: absolute; top: 100%; left: 0px; z-index: 1000; background-color: rgb(255, 255, 255); border: 1px solid rgb(51, 51, 51); list-style: none; padding: 0px; margin: 4px 0px 0px; min-width: 150px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
    <li style="margin: 0px; padding: 0px;"><a class="switcher-locale-en" href="/" style="display: block; padding: 8px 12px; color: rgb(0, 123, 255); text-decoration: none; transition: background-color 0.3s ease; cursor: not-allowed; font-weight: bold;">English</a></li>
    <li style="margin: 0px; padding: 0px;"><a class="switcher-locale-de" href="/" style="display: block; padding: 8px 12px; color: rgb(51, 51, 51); text-decoration: none; transition: background-color 0.3s ease; cursor: pointer;">DE</a></li>
    <li style="margin: 0px; padding: 0px;"><a class="switcher-locale-ar" href="/" style="display: block; padding: 8px 12px; color: rgb(51, 51, 51); text-decoration: none; transition: background-color 0.3s ease; cursor: pointer;">ar</a></li>
  </ul>
</div>
- nuxt closed → <div style="position: relative; display: inline-block;">
  <!-- @slot Content before the button that opens the dropdown. --><button class="language-switcher" style="padding: 4px 12px; font-size: 16px; cursor: pointer; background-color: rgb(255, 255, 255); border: 1px solid rgb(51, 51, 51); transition: background-color 0.3s ease; display: flex; align-items: center; justify-content: space-between;">
    <!-- @slot Content before the active locale label inside the button. --> English
    <!-- @slot Content after the active locale label inside the button. --><span style="margin-left: 8px; transition: transform 0.3s ease;">▾</span>
  </button><!-- @slot Content between the button and the dropdown panel. -->
  <ul style="position: absolute; top: 100%; left: 0px; z-index: 10; background-color: rgb(255, 255, 255); border: 1px solid rgb(51, 51, 51); list-style: none; padding: 0px; margin: 4px 0px 0px; display: none;">
    <!-- @slot Content at the top of the dropdown, above the locale list. -->
    <li style="margin: 0px; padding: 0px;">
      <!-- @slot Content before each locale entry. --><a href="/en/page" class="switcher-locale-en" style="display: block; padding: 8px 12px; color: rgb(0, 123, 255); text-decoration: none; transition: background-color 0.3s ease; font-weight: bold; cursor: not-allowed;" hreflang="en-US">
        <!-- @slot Content before a locale's label inside its link. --> English
        <!-- @slot Content after a locale's label inside its link. -->
      </a><!-- @slot Content after each locale entry. -->
    </li>
    <li style="margin: 0px; padding: 0px;">
      <!-- @slot Content before each locale entry. --><a href="/de/page" class="switcher-locale-de" style="display: block; padding: 8px 12px; color: rgb(51, 51, 51); text-decoration: none; transition: background-color 0.3s ease;" hreflang="de-DE">
        <!-- @slot Content before a locale's label inside its link. --> DE
        <!-- @slot Content after a locale's label inside its link. -->
      </a><!-- @slot Content after each locale entry. -->
    </li>
    <li style="margin: 0px; padding: 0px;">
      <!-- @slot Content before each locale entry. --><a href="/ar/page" class="switcher-locale-ar" style="display: block; padding: 8px 12px; color: rgb(51, 51, 51); text-decoration: none; transition: background-color 0.3s ease;" hreflang="ar-EG">
        <!-- @slot Content before a locale's label inside its link. --> ar
        <!-- @slot Content after a locale's label inside its link. -->
      </a><!-- @slot Content after each locale entry. -->
    </li><!-- @slot Content at the bottom of the dropdown, below the locale list. -->
  </ul><!-- @slot Content after the dropdown panel. -->
</div>
- nuxt open → <div style="position: relative; display: inline-block;">
  <!-- @slot Content before the button that opens the dropdown. --><button class="language-switcher" style="padding: 4px 12px; font-size: 16px; cursor: pointer; background-color: rgb(255, 255, 255); border: 1px solid rgb(51, 51, 51); transition: background-color 0.3s ease; display: flex; align-items: center; justify-content: space-between;">
    <!-- @slot Content before the active locale label inside the button. --> English
    <!-- @slot Content after the active locale label inside the button. --><span style="transition: transform 0.3s ease; margin-left: 8px; transform: rotate(180deg);">▾</span>
  </button><!-- @slot Content between the button and the dropdown panel. -->
  <ul style="position: absolute; top: 100%; left: 0px; z-index: 10; background-color: rgb(255, 255, 255); border: 1px solid rgb(51, 51, 51); list-style: none; padding: 0px; margin: 4px 0px 0px;">
    <!-- @slot Content at the top of the dropdown, above the locale list. -->
    <li style="margin: 0px; padding: 0px;">
      <!-- @slot Content before each locale entry. --><a href="/en/page" class="switcher-locale-en" style="display: block; padding: 8px 12px; color: rgb(0, 123, 255); text-decoration: none; transition: background-color 0.3s ease; font-weight: bold; cursor: not-allowed;" hreflang="en-US">
        <!-- @slot Content before a locale's label inside its link. --> English
        <!-- @slot Content after a locale's label inside its link. -->
      </a><!-- @slot Content after each locale entry. -->
    </li>
    <li style="margin: 0px; padding: 0px;">
      <!-- @slot Content before each locale entry. --><a href="/de/page" class="switcher-locale-de" style="display: block; padding: 8px 12px; color: rgb(51, 51, 51); text-decoration: none; transition: background-color 0.3s ease;" hreflang="de-DE">
        <!-- @slot Content before a locale's label inside its link. --> DE
        <!-- @slot Content after a locale's label inside its link. -->
      </a><!-- @slot Content after each locale entry. -->
    </li>
    <li style="margin: 0px; padding: 0px;">
      <!-- @slot Content before each locale entry. --><a href="/ar/page" class="switcher-locale-ar" style="display: block; padding: 8px 12px; color: rgb(51, 51, 51); text-decoration: none; transition: background-color 0.3s ease;" hreflang="ar-EG">
        <!-- @slot Content before a locale's label inside its link. --> ar
        <!-- @slot Content after a locale's label inside its link. -->
      </a><!-- @slot Content after each locale entry. -->
    </li><!-- @slot Content at the bottom of the dropdown, below the locale list. -->
  </ul><!-- @slot Content after the dropdown panel. -->
</div>
