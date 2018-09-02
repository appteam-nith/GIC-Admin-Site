import json

def parse(json_str, template_str):
	
	#parsed_json = json.loads(json_str)

	x = r"""
	\cvsection{Summary}
	\begin{cvparagraph}\\\\
	Hello, world!
	\end{cvparagraph}
	"""

	return template_str.replace("[content]",x)