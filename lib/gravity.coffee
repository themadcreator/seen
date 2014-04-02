# ## Apache 2.0 License

#     Copyright 2013, 2014 github/themadcreator

#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at

#     http://www.apache.org/licenses/LICENSE-2.0

#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

(this ? exports).Gravity = {}

G          = 6.67 # 6.67e-11
DT         = 0.5
SPHERE_VOL = 4/3*Math.PI

interpolatePoints = (a, b, t) ->
  return seen.P(
    a.x*(1.0 - t) + b.x*t
    a.y*(1.0 - t) + b.y*t
    a.z*(1.0 - t) + b.z*t
  )

class Gravity.Body
  constructor : (options) ->
    _.extend(@, _.defaults(options, 
      mass         : 10
      radius       : 10
      position     : seen.P()
      velocity     : seen.P()
      force        : seen.P()
      acceleration : seen.P()
      accelRk4     : [seen.P(), seen.P(), seen.P()]
      color        : '#FFFFFF'
    ))

  integrate : ->
    @position.add @velocity.copy().multiply(DT).add @acceleration.copy().multiply(DT*DT*0.5)
    @velocity.add @acceleration.copy().multiply(DT)

  # Creates a new body that is the result of a collision between this and other.
  # Assuming positions and velocities will combine proportionally to mass.
  # Conserves volume and mass.
  collide: (other) ->
    t = other.mass / (@mass + other.mass)

    volA      = SPHERE_VOL*Math.pow(@radius,3.0)
    volB      = SPHERE_VOL*Math.pow(other.radius,3.0)
    newRadius = Math.pow((volA + volB) / SPHERE_VOL,1/3.0)

    return new Gravity.Body(
      name         : @name + '+' + other.name
      mass         : @mass + other.mass
      radius       : newRadius
      position     : interpolatePoints(@position, other.position, t)
      velocity     : interpolatePoints(@velocity, other.velocity, t)
      force        : @force.copy().add other.force
      acceleration : @acceleration.copy().add other.acceleration
    )

Gravity.Bodies = {
  random : (n) ->
    return [0...n].map (i) ->
      mass     = Math.random()*30
      massN    = n*5
      position = seen.P(Math.random()*800 - 400, Math.random()*800 - 400, Math.random()*800 - 400)
      speed    = Math.sqrt(G * (mass + massN) / Math.sqrt(position.dot(position)))
      velocity = seen.P(Math.random()*10 - 5, Math.random()*10 - 5, Math.random()*10 - 5)
      velocity.subtract(position.copy().multiply(position.dot(velocity) / position.dot(position)))
      velocity.multiply(speed / Math.sqrt(velocity.dot(velocity)))
      new Gravity.Body
        name     : "Body-#{i}"
        mass     : mass
        position : position
        velocity : velocity
        radius   : Math.random()*20
}

class Gravity.Simulation
  constructor : (@model) ->

  simulate : ->
    @model.ticks += 1

    @resetForces()
    collisions = @accumulateForces()
    @resolveCollisions(collisions)
    @integrateMotion()
    return collisions

  resetForces : ->
    # Reset forces
    for object in @model.objects
      object.force = seen.P()

  accumulateForces : ->
    # Accumulate forces
    collisions = []
    for a, ai in @model.objects
      for b, bi in @model.objects
        continue unless bi > ai

        ab         = a.position.copy().subtract(b.position)
        force      = G * a.mass * b.mass / ab.dot(ab)
        dist       = Math.sqrt(ab.dot(ab))
        forceScale = force/dist
        a.force.add ab.copy().multiply(-forceScale)
        b.force.add ab.copy().multiply(forceScale)

        if dist < (a.radius + b.radius)
          collisions.push {a, b, ai, bi}
    return collisions

  resolveCollisions : (collisions) ->
    # Resolve collisions
    newObjects = {}
    for collision in collisions
      newA = newObjects[collision.ai]
      newB = newObjects[collision.bi]
      a    = newA?.object ? collision.a
      b    = newB?.object ? collision.b

      continue if a is b

      # collide
      c = a.collide(b)

      # update model
      if (ai = @model.objects.indexOf(a)) >= 0 then @model.objects.splice(ai,1)
      if (bi = @model.objects.indexOf(b)) >= 0 then @model.objects.splice(bi,1)
      @model.objects.push c

      # update newObjects
      ids = _([collision.ai, collision.bi, newA?.ids, newA?.ids]).flatten().compact().value()
      for id in ids
        newObjects[id] = {
          ids    : ids
          object : c
        }
    return

  integrateMotion : ->
    # Integrate motion
    for object in @model.objects
      object.acceleration = object.force.copy().multiply(1/object.mass)
      object.integrate()

