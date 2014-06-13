<h1>Vkontakte Social Authentication</h1>
<hr />

<form>
	<div class="alert alert-warning">
		<p>
			Register a new <strong>Vkontakte Application</strong> via 
			<a href="http://vk.com/dev">Application Development</a> and then paste
			your application details here. Your callback URL is yourdomain.com/auth/vkontakte/callback
		</p>
		<br />
		<input type="text" data-field="social:vkontakte:id" title="Client ID" class="form-control input-lg" placeholder="Client ID"><br />
		<input type="text" data-field="social:vkontakte:secret" title="Client Secret" class="form-control" placeholder="Client Secret"><br />
	</div>
</form>

<button class="btn btn-lg btn-primary" id="save">Save</button>

<script>
	require(['forum/admin/settings'], function(Settings) {
		Settings.prepare();
	});
</script>