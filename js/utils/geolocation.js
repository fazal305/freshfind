export function isGeolocationSupported() {
  return "geolocation" in navigator;
}

export function requestLocation() {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject({
        code: "unsupported",
        message: "Geolocation is not supported in this browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject({ code: "denied", message: "Location access was denied." });
        } else {
          reject({
            code: "unavailable",
            message: "Your location could not be determined.",
          });
        }
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  });
}
