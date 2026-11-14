// Keep old campaign links while maintaining a single landing-page source.
const destination = new URL('../index.html', location.href);
destination.search = location.search;
destination.hash = location.hash;
location.replace(destination.href);
