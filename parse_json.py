import json

def parse(json_str, template_str):

	parsed_json = json.loads(json_str)
	name = parsed_json["Name"]
	mobile = str(parsed_json["Mobile"])
	email = parsed_json["Email"]
	branch = parsed_json["Branch"]

	x = r"""
	\cvsection{Summary}
	\begin{cvparagraph}\\\\
	Hello, world!
	\end{cvparagraph}
	"""

	template_str = template_str.replace("[content]",x)
	template_str = template_str.replace("[firstname]",name)
	template_str = template_str.replace("[lastname]", "")
	template_str = template_str.replace("[mobile]", mobile)
	template_str = template_str.replace("[email]", email)
	template_str = template_str.replace("[branch]", branch)



	return template_str
