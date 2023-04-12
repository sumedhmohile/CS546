from web3 import Web3, HTTPProvider, HTTPR

w3 = Web3(Web3.HTTPProvider(<infura or alchemy URL>))

def verify(request, message, signedMessage):
    response = w3.geth.personal.ecRecover(message, signature)
    # return HttpResponse(response, content_type='text/json')