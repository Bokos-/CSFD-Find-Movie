// Safari

function redirect(url)
{
	safari.application.activeBrowserWindow.openTab().url = url;
	safari.self.hide();
}