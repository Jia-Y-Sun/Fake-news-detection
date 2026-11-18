from faknow.run import run
import os
class SEUClass:
    def __init__(self):
        self.model:str="NULL"
        
        self.train_json:str="NULL"
        
        self.test_json:str="NULL"
        self.supported_models = self._get_supported_models()
    def _get_supported_models(self):
        import faknow.run.content_based as cb
        import faknow.run.social_context as sc
        import inspect

        def extract_model_names(module):
            return {
                name[4:] for name, obj in vars(module).items()
                if inspect.isfunction(obj) and name.startswith("run_") and not name.endswith("_from_yaml")
            }

        return extract_model_names(cb) | extract_model_names(sc)
    def loadModel(self,modelName:str):
        self.model=modelName
    
    def loadTrainJson(self,path:str):
        if not os.path.exists(path):
            raise FileNotFoundError(f"[错误] 训练集文件不存在: {path}")
        if not path.lower().endswith(".json"):
            raise ValueError(f"[错误] 训练集必须是 .json 文件: {path}")
        self.train_json = path
    def loadTestJson(self, path: str):
        if not os.path.exists(path):
            raise FileNotFoundError(f"[错误] 测试集文件不存在: {path}")
        if not path.lower().endswith(".json"):
            raise ValueError(f"[错误] 测试集必须是 .json 文件: {path}")
        self.test_json = path
    def runModel(self):
        if self.model == "NULL" or self.train_json == "NULL" or self.test_json == "NULL":
            raise RuntimeError("[错误] 请先正确加载模型和数据路径")

        try:
            kwargs = {
                "train_path": self.train_json,
                "test_path": self.test_json,
            }

            # 如果传入的是路径，则使用 base_model_path 参数
            if os.path.isdir(self.model):
                kwargs["base_model_path"] = self.model
                kwargs["model_name"] = "endef"  # 指定要使用的模型类型
            else:
                kwargs["model_name"] = self.model

            from faknow.run import run
            run(**kwargs)
            print("[运行成功] 模型已完成运行")

        except Exception as e:
            raise RuntimeError(f"[运行失败] 执行模型时发生错误: {str(e)}")