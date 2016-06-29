angular.module('mrlapp.service.MotorGui', [])
.controller('MotorGuiCtrl', ['$scope', '$log', 'mrl', function($scope, $log, mrl) {
    $log.info('MotorGuiCtrl');
    var _self = this;
    var msg = this.msg;
    
    // init scope variables
    $scope.isAttached = false;
    $scope.newEncoderType = null;
    $scope.newEncoderPin = null;
    $scope.controller = '';
    $scope.controllers = [];
    $scope.newType = '';
    $scope.pins = [];
    for (i = 0; i < 54; ++i) {
        $scope.pins.push(i);
    }
    
    $scope.newPin0 = null ;
    $scope.newPin1 = null ;
    
    // GOOD TEMPLATE TO FOLLOW
    this.updateState = function(service) {
        $scope.service = service;
        $scope.newType = service.type;
        $scope.newPin0 = service.pwmPin;
        $scope.newPin1 = service.dirPin;
        $scope.newEncoderType = service.encoderType;
        $scope.newEncoderPin = service.encoderPin;
        $scope.newController = service.controllerName;
        $scope.position = service.currentPos;

        $scope.isAttached = !(angular.isUndefined(service.controllerName) || service.controllerName === null);
        // combo boxes need a "passthrough" model 
        // and should not be assigned the service variable to the model
        // directly
    }
    ;
    
    _self.updateState($scope.service);
    
    this.onMsg = function(inMsg) {
        switch (inMsg.method) {
        case 'onState':
            _self.updateState(inMsg.data[0]);
            $scope.$apply();
            break;
       case 'onUpdatePosition':
            $scope.position = inMsg.data[0];
            $scope.$apply();
            break;            
        case 'onServiceNamesFromInterface':
            $scope.controllers = inMsg.data[0];
            $scope.$apply();
            break;
        default:
            $log.error("ERROR - unhandled method " + $scope.name + " " + inMsg.method);
            break;
        }
    }
    ;
    
    $scope.attach = function() {
        $log.info('attach');
        // TODO - check validity
        msg.send('attach', $scope.newController, $scope.newType, $scope.newPin0, $scope.newPin1, $scope.newEncoderType, $scope.newEncoderPin);
    }
    
    $scope.detach = function() {
        $log.info('detach');
        msg.send('detach');
    }
    
    $scope.moveTo = function() {
        $log.info('moveTo');
        msg.send('moveTo', $scope.moveToPos);
    }
    
    msg.subscribe("updatePosition")
    var runtimeName = mrl.getRuntime().name;
    // subscribe from Runtime --> WebGui (gateway)
    mrl.subscribe(runtimeName, 'getServiceNamesFromInterface');
    // subscribe callback from nameMethodCallbackMap --> onMsg !!!! FIXME - since this is to a "different" service and
    // not self - it can be overwritten by another service subscribing to the same service.method  :(
    mrl.subscribeToServiceMethod(this.onMsg, runtimeName, 'getServiceNamesFromInterface');
    msg.subscribe(this);
    mrl.sendTo(runtimeName, 'getServiceNamesFromInterface', 'org.myrobotlab.service.interfaces.MotorController');
}
]);
