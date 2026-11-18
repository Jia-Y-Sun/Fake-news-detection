from flask import Flask, request, jsonify
from flask_cors import CORS
from SEUclass import SEUClass

app = Flask(__name__)
CORS(app)  
seu = SEUClass()

@app.route('/load_model', methods=['POST'])
def load_model():
    data = request.json
    try:
        seu.loadModel(data['model'])
        return jsonify({"status": "success", "message": "模型加载成功"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/load_train_json', methods=['POST'])
def load_train():
    data = request.json
    try:
        seu.loadTrainJson(data['path'])
        return jsonify({"status": "success", "message": "训练集加载成功"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/load_test_json', methods=['POST'])
def load_test():
    data = request.json
    try:
        seu.loadTestJson(data['path'])
        return jsonify({"status": "success", "message": "测试集加载成功"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/run_model', methods=['POST'])
def run_model():
    try:
        seu.runModel()
        return jsonify({"status": "success", "message": "模型运行成功"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/supported_models', methods=['GET'])
def supported_models():
    return jsonify({"supported_models": list(seu.supported_models)})

if __name__ == '__main__':
    app.run(debug=True)
