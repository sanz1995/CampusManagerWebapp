(function() {
    'use strict';

    angular
        .module('app.buildings.betan')
        .controller('BetanController', BetanController);

    BetanController.inject = ['$scope','leafletData','$compile','MapService','ModalService'];

    function BetanController($scope,leafletData,$compile,MapService,ModalService) {
        //console.log("Invocado controlador del Betan");
        var vm = this;
        var currentFloor = 0;

        vm.report = report;

        function report(ubicacion){
            ModalService.open(ubicacion);
        }

        //Actualizando titulos del html
        $scope.vista={
            nombre : 'Edificio Betancourt'
        };
        $scope.edificio={
            nombre : 'Planta ' + currentFloor
        };

        //Arrays de capas
        $scope.definedLayers = {
            wmsSotano: MapService.crearCapa('Sótano', 'labis:betanS01'),
            wms0 : MapService.crearCapa('Planta 0','labis:betanP00'),
            wms1 : MapService.crearCapa('Planta 1','labis:betanP01'),
            wms2 : MapService.crearCapa('Planta 2','labis:betanP02'),
            wms3 : MapService.crearCapa('Planta 3','labis:betanP03')
        };

        angular.extend($scope, {
            betan: {
                lat: 41.683422,
                lng: -0.884168,
                zoom: 18
            },
            events: {},
            layers: {
                baselayers: {
                    wms0: $scope.definedLayers['wms0']
                }
            },
            markers: [],
            controls:{
                bajarNivel:{
                    type: 'bajarPlanta'
                },
                subirNivel:{
                    type: 'subirPlanta'
                }
            }
        });

        leafletData.getMap().then(function() {
            var element = document.getElementById('botonSubir');
            var element2 = document.getElementById('botonBajar');
            $compile(element)($scope);
            $compile(element2)($scope);
        });

        $scope.$on('leafletDirectiveMap.click', function (event, args) {
            var leafEvent = args.leafletEvent;

            var latitude = leafEvent.latlng.lat;
            var longitude = leafEvent.latlng.lng;

            //Lat: latitude.toString(), Long: longitude.toString()

            $scope.markers = [];

            //Encontrar ubicacion (enganchar a API)
            var ubicacion = 'Aula A.01';

            //Si no ha encontrado ubicacion, no le dejamos crear incidencias

            if(ubicacion == undefined){
                $scope.markers.push({
                    lat: latitude,
                    lng: longitude,
                    message: "¡Estás aquí!",
                    focus: true,
                    draggable: false
                });
            } else{
                $scope.markers.push({
                    lat: latitude,
                    lng: longitude,
                    message: "<div style='text-align: center;'>" + ubicacion + ":</br> ¿Tienes alguna incidencia que reportar? </br> "
                    + "<a href=\"\" ng-click=\"vm.report('" + ubicacion + "')\">"
                    + "<span>Reportar</span>"
                    + "</a></div>",
                    getMessageScope: function() { return $scope; },
                    focus: true,
                    draggable: false
                });
            }
        });

        $scope.subirPlanta = function(){
            if(currentFloor == 3){
                //console.log("Llegado al limite superior del Betancourt");
            } else{
                //console.log("Subiendo planta del Betancourt (Planta actual: " + parseInt(currentFloor+1) + ")");

                var baselayers = $scope.layers.baselayers;

                if(currentFloor == -1){
                    delete baselayers['wmsSotano'];
                } else delete baselayers['wms' + currentFloor];

                currentFloor++;
                baselayers['wms' + currentFloor] = $scope.definedLayers['wms' + currentFloor];
                $scope.edificio={
                    nombre : 'Planta ' + currentFloor
                };
            }
        };

        $scope.bajarPlanta = function(){
            if(currentFloor == -1){
                //console.log("Llegado al limite inferior del Betancourt");
            } else{
                //console.log("Bajando planta del Betancourt (Planta actual: " + parseInt(currentFloor-1) + ")");

                var baselayers = $scope.layers.baselayers;
                delete baselayers['wms' + currentFloor];

                currentFloor--;

                if(currentFloor == -1){
                    baselayers['wmsSotano'] = $scope.definedLayers['wmsSotano'];
                    $scope.edificio = {
                        nombre: 'Sótano'
                    };
                } else{
                    baselayers['wms' + currentFloor] = $scope.definedLayers['wms' + currentFloor];
                    $scope.edificio = {
                        nombre: 'Planta ' + currentFloor
                    };
                }
            }
        };
    }
})();
