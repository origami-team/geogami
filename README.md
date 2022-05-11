# GeoGami

## Installation and Usage
- Clone / download the repo
- Run `yarn install`
- Build & deploy to <b>Android</b>
  - Prerequisites
      - Java JDK 8
      - Android Studio
  - Run the following CLI commands
    - `npx cap copy`
    - `npx Jetify`
    - `npx cap sync`
    - `npx cap open android`

- Build & deploy to <b>iOS</b>:
  - Prerequisites
    - macOS
    - Xcode, install it from the App Store
    - iOS Developer account, sign up on [developer.apple.com](https://developer.apple.com/), it's free
  - Run the following CLI command
    - `yarn build`
    - `npx cap sync ios`
    - `npx cap open ios`

## Troubleshooting
While scanning for nearby beacons you may run into:
```
Cannot read property 'locationManager' of undefined
```
This is due to instability of the iBeacon plugin. To overcome the issue, replace some files with the ones you have in the project, [see here](https://github.com/YouQam/ionic5ibeacon).

## Contact

Spatial Intelligence Lab (SIL)

Institute for Geoinformatics

University of Münster

Heisenbergstraße 2

48149 Münster

**Mail:** geogami.ifgi(at)uni-muenster.de

**Team:** https://geogami.ifgi.de/kontakt.html#team

## License

MIT
