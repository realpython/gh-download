export function createSpinner() {
  const spinner = document.createElement("div");
  spinner.id = "spinner";
  spin(spinner);
  return spinner;
}

function spin(element) {
  let handle;
  try {
    let chars = "⠁⠂⠄⡀⢀⠠⠐⠈".split("");
    let char = chars.shift();
    element.innerHTML = char;
    chars.push(char);
    handle = setTimeout(spin, 10);
  } catch (e) {
    clearTimeout(handle);
  }
}
