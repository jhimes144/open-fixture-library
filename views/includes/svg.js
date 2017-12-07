const fs = require('fs');
const path = require('path');

module.exports = {
  getSvg,
  getCategoryIcon,
  getChannelTypeIcon,
  getColorCircle
};

/**
 * Returns the contents of the provided SVG file as an inline SVG.
 * @param {!string} svgBasename Name of the file (withoug extension).
 * @param {!Array.<string>} classNames List of class names the <svg> tag should have.
 * @returns {!string} The inline <svg> tag or an empty string if the file was not found.
 */
function getSvg(svgBasename, classNames = []) {
  const filename = path.join(__dirname, '..', '..', 'static', 'icons', `${svgBasename}.svg`);

  if (!fs.existsSync(filename)) {
    console.error(`svg file '${svgBasename}.svg' not found`);
    return '';
  }

  let svg = fs.readFileSync(filename, 'utf8').replace(/\s+$/, '');

  if (classNames.length > 0) {
    svg = svg.replace(/<svg([^>]*)>/, `<svg$1 class="${classNames.join(' ')}">`);
  }

  return svg;
}

/**
 * Get an icon for the provided category.
 * @param {!string} categoryName Name of the category.
 * @param {!Array.<string>} classNames List of class names the <svg> tag should have.
 * @returns {!string} The inline <svg> tag or an empty string if the file was not found.
 */
function getCategoryIcon(categoryName, classNames = []) {
  const sanitzedCategoryName = categoryName.toLowerCase().replace(/[^\w]+/g, '-');
  classNames.push(`category-${sanitzedCategoryName}`, 'category-icon', 'icon');

  const svg = getSvg(`categories/${sanitzedCategoryName}`, classNames);
  return svg.replace(/(<svg[^>]*>)/, `$1<title>Category: ${categoryName}</title>`);
}

/**
 * Get an icon for the provided channel type.
 * @param {!string} channelType Channel type to find the icon for.
 * @param {!Array.<string>} classNames List of class names the <svg> tag should have.
 * @returns {!string} The inline <svg> tag or an empty string if the file was not found.
 */
function getChannelTypeIcon(channelType, classNames = []) {
  const sanitzedChannelType = channelType.toLowerCase().replace(/[^\w]+/g, '-');
  classNames.push(`channel${sanitzedChannelType}`, 'channel-icon', 'icon');

  const svg = getSvg(`channel-types/${sanitzedChannelType}`, classNames);
  return svg.replace(/(<svg[^>]*>)/, `$1<title>Channel type: ${channelType}</title>`);
}

/**
 * Get inline SVG for a color circle (like a pie chart with equally-sized pies).
 * @param {!Array.<string>} colors Array of color strings to display.
 * @param {?string} [title] Text for the title tag. If this parameter is not given, no title tag will be added.
 * @returns {!string} The HTML for displaying the color circle.
 */
function getColorCircle(colors, title) {
  // viewBox customized to have the (0,0) coordinate in the center
  let str = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24" viewBox="-12 -12 24 24" class="icon color-circle">';

  if (title) {
    str += `<title>${title}</title>`;
  }

  const radius = 9;

  // use current fill color as background / border
  str += `<circle cx="0" cy="0" r="${radius + 1}" />`;

  if (colors.length === 1) {
    str += `<circle cx="0" cy="0" r="${radius}" fill="${colors[0]}" />`;
  }
  else {
    const slicePercent = 1.0 / colors.length;

    const xAxisRotation = 0;
    const largeArcFlag = 0;
    const sweepFlag = 1;

    for (let i = 0; i < colors.length; i++) {
      const [startX, startY] = getCoordinatesForPercent(i * slicePercent, radius);
      const [endX, endY] = getCoordinatesForPercent((i + 1) * slicePercent, radius);

      const pathMove = `M ${startX} ${startY}`;
      const pathArc = `A ${radius} ${radius} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`;
      const pathLine = 'L 0 0';

      str += `<path d="${pathMove} ${pathArc} ${pathLine}" fill="${colors[i]}" />`;
    }
  }

  str += '</svg>';

  return str;
}

/**
 * Get x and y coordinates of the point that is `percent` percent of the way around a circle. Note that 37.5% are added to start at a 135deg angle.
 * @param {!number} percent Percent of the whole circle.
 * @param {!number} radius Radius of the circle.
 * @returns {Array.<number>} Array with x and y coordinate.
 */
function getCoordinatesForPercent(percent, radius) {
  percent += 0.375;

  const x = radius * Math.cos(2 * Math.PI * percent);
  const y = radius * Math.sin(2 * Math.PI * percent);
  return [x, y];
}
