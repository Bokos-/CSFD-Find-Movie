// Chrome

function redirect(url)
{
	chrome.tabs.create({url: url});
}